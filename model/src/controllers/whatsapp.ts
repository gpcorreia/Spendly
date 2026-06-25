import { Request, Response, NextFunction } from 'express';
import { WhatsAppService } from '../services/whatsapp';
import { UserRepository } from '../repositories/userRepository';
import { ExpenseRepository } from '../repositories/expenseRepository';
import { userResponses } from '../messages/userResponses';
import { formatAdvicePrompt } from '../prompts/advicePrompt';
import { formatOperationPrompt } from '../prompts/operationPrompts';
import { AIModel } from '../config/aiModel';
import {
  validateAdviceResponse,
  validateAIResponse,
} from '../validation/aiResponse';
import type {
  AIResponse,
  AIResponseAdvice,
  User,
  WhatsAppMessage,
  WhatsAppWebhookValue,
} from '../types';

const months: Record<string,string> = {
  "01": "Janeiro",
  "02": "Fevereiro",
  "03": "Mar\u00e7o",
  "04": "Abril",
  "05": "Maio",
  "06": "Junho",
  "07": "Julho",
  "08": "Agosto",
  "09": "Setembro",
  "10": "Outubro",
  "11": "Novembro",
  "12": "Dezembro",
}


export class WhatsAppController {
  private whatsappService: WhatsAppService;
  private userRepository: UserRepository;
  private ExpenseRepository: ExpenseRepository;
  private model: AIModel;
  private userRes: userResponses;
  private advicePrompt : string;
  private processedMessageIds = new Set<string>();



  constructor() {
    this.whatsappService = new WhatsAppService();
    this.userRepository = new UserRepository();
    this.ExpenseRepository = new ExpenseRepository();
    this.model = new AIModel();
    this.userRes = new userResponses();
    this.advicePrompt = formatAdvicePrompt();
  }

  // add message to the queue and check if it was processed in the last hour to avoid duplicates in case of webhook retries
  checkMessageAuthenticy = (res: Response, payload: WhatsAppMessage): boolean => {

    if (this.processedMessageIds.has(payload.message_id)) {
      console.log('Duplicate WhatsApp webhook ignored:', payload.message_id);
      res.status(200).json({ received: true, duplicate: true });
      return false;
    }

    this.processedMessageIds.add(payload.message_id);
    setTimeout(() => this.processedMessageIds.delete(payload.message_id), 1000 * 60 * 60);
    res.status(200).json({ received: true });
    return true;
  }

  operationsPath = async (aiResponse: AIResponse, user:User): Promise<string> => {
    
    let msg = '';

    
    if(aiResponse.function === 'create_expense') {
        await this.ExpenseRepository.createExpense(user.id,aiResponse);
        msg = this.userRes.expenseCreated(
          aiResponse.args.amount!,
          aiResponse.args.category!,
          aiResponse.args.date!,
          aiResponse.args.description,
        );
      }
      
      else if(aiResponse.function === 'get_category_spending') {
        if(aiResponse.args.category) {
          const specificCategorySpending = await this.ExpenseRepository.get_specific_category_spending(user.id,aiResponse);
          msg = this.userRes.categorySummary(
            aiResponse.args.category,
            months[aiResponse.args.period!] ?? aiResponse.args.period!,
            specificCategorySpending.list_of_expenses,
            specificCategorySpending.total,
          );
        }
        else{
          const categorySpending = await this.ExpenseRepository.get_category_spending(user.id,aiResponse);
          msg = this.userRes.monthlyByCategory(
            months[aiResponse.args.period!] ?? aiResponse.args.period!,
            categorySpending.total,
            categorySpending.result,
          );
        }
      }
      
      else if(aiResponse.function === 'get_days_spending_month') {
        const expensesofMonth = await this.ExpenseRepository.get_days_spending_month(user.id,aiResponse);
        msg = this.userRes.monthlySummary(
          months[aiResponse.args.period!] ?? aiResponse.args.period!,
          expensesofMonth.total,
          expensesofMonth.data,
        );
      }
      
      else if(aiResponse.function === 'delete_last_expense') {
        const lastExpense = await this.ExpenseRepository.delete_last_expense(user.id);
        msg = lastExpense===0 ?this.userRes.lastExpenseDeleted(lastExpense) : this.userRes.generalError();
      }

      return msg;

  }

  advicePath = async (aiResponse: AIResponse, user:User): Promise<string> => {
    
    let msg = '';

    const last2monthsExpenses = await this.ExpenseRepository.get_saving_advice(user.id);
    const adviceResponse: AIResponseAdvice = await this.model.getAIResponse(
      JSON.stringify(last2monthsExpenses),
      this.advicePrompt,
      validateAdviceResponse,
    );
    msg = adviceResponse.msg;
  
    return msg;

  }
  
  handleMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const value = req.body.value ?? req.body.entry?.[0]?.changes?.[0]?.value as WhatsAppWebhookValue | undefined;
      const message = value?.messages?.[0];
      let msg = '';

      if (!value || !message) {
        res.status(200).json({ received: true, ignored: true });
        return;
      }

      if (message.type && message.type !== 'text') {
        res.status(200).json({ received: true, ignored: true, type: message.type });
        return;
      }

      const payload: WhatsAppMessage = {
        message_id: message.id ?? `${message.from}-${message.timestamp}`,
        number_id: value.metadata.phone_number_id,
        number_name: value.contacts?.[0]?.profile?.name ?? '',
        number: message.from,
        timestamp: message.timestamp,
        body: message.text?.body ?? '',
      };

      const shouldProcessMessage = this.checkMessageAuthenticy(res, payload);
      if (!shouldProcessMessage) {
        return;
      }

      const user = await this.userRepository.findOrCreate({
        phoneNumber: payload.number,
        name: payload.number_name,
        number_id: payload.number_id,
        timestamp: payload.timestamp,
        email: '',
      });

      try {
        // Rebuild the prompt for every message so relative dates always use today's date.
        const aiResponse = await this.model.getAIResponse(
          payload.body,
          formatOperationPrompt(),
          validateAIResponse,
        );

        console.log('AI operation validated:', {
          messageId: payload.message_id,
          type: aiResponse.type,
          function: aiResponse.function,
          confidence: aiResponse.confidence,
        });

        if (aiResponse.type === 'advice') {
          msg = await this.advicePath(aiResponse,user);
        }
        else if(aiResponse.type === 'operation'){
          msg = await this.operationsPath(aiResponse,user);
        }

        if (!msg) {
          msg = aiResponse.user_reply || this.userRes.generalError();
        }
      } catch (error) {
        console.error('Unable to process AI operation:', {
          messageId: payload.message_id,
          error: error instanceof Error ? error.message : String(error),
        });
        msg = this.userRes.generalError();
      }

      if(process.env.TEST_MODE === 'true') {
        console.log('TEST_MODE MESSAGE:', {
          to: payload.number,
          message: msg,
        });
      }
      // const data = await this.whatsappService.sendMessage(payload.number, msg);
      // if (!data) {
      //   console.error('Failed to send WhatsApp message:', payload.message_id);
      // }
    } catch (error) {
      console.error('Error handling WhatsApp webhook:', error);
      if (!res.headersSent) {
        res.status(500).json(error);
      }
    }
  }

  verifyWebhook = (req: Request, res: Response): void => {
    const mode = req.query['hub.mode'] as string;
    const token = req.query['hub.verify_token'] as string;
    const challenge = req.query['hub.challenge'] as string; 

    const verificationResult = this.whatsappService.verifyWebhook(mode, challenge, token);

    if (verificationResult) {
      res.status(200).send(verificationResult);
    } else {
      res.sendStatus(403);
    }
  }


  firstMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.user_id || req.body.user_id;
      const user = await this.userRepository.findIfActivate(userId);
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found or inactive' });
        return;
      }

      const message = this.userRes.firstMessage(user);
      const sent = await this.whatsappService.sendMessage(user.phone_number, message);
      
      if(sent) {
        res.status(200).json({ success: true, message: 'First WhatsApp message sent' });
      } else {
        res.status(500).json({ success: false, error: 'Failed to send WhatsApp message' });
      }
    } catch (error) {
      console.error('Error sending first WhatsApp message:', error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: 'Failed to send first WhatsApp message' });
      }
    }
  }
}
