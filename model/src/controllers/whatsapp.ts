import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import { WhatsAppService } from '../services/whatsapp';
import { User, UserRepository } from '../repositories/userRepository';
import { ExpenseRepository } from '../repositories/expenseRepository';
import { createExpenseGasolina, deleteLastExpense, getSpendingSummary, getDaysSpendingMonth, createExpenseJantar, getCategorySpendingFood, createExpensePrenda, createExpenseTelemovel } from '../aiMockResponses';
import { AIResponse } from '../aiMockResponses';
import { userResponses } from '../messages/userResponses';
import { OpenAI } from 'openai';
import { formatIntentPrompt } from '../prompts/intentPrompt';
import { formatAdvicePrompt } from '../prompts/advicePrompt';
import { formatAIConfigPrompt } from '../prompts/prompts';
import { AIModel } from '../config/aiModel';

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


type WhatsAppMessage = {
  number_id: string;
  number_name: string;
  number: string;
  timestamp: string;
  body: string;
};

type WhatsAppWebhookValue = {
  metadata: {
    phone_number_id: string;
  };
  contacts?: Array<{
    profile?: {
      name?: string;
    };
  }>;
  messages?: Array<{
    from: string;
    timestamp: string;
    text?: {
      body?: string;
    };
    type?: string;
  }>;
};

type AIResponseAdvice={
  msg:string;
}

export class WhatsAppController {
  private whatsappService: WhatsAppService;
  private userRepository: UserRepository;
  private ExpenseRepository: ExpenseRepository;
  private model: AIModel;
  private userRes: userResponses;
  private intentPrompt : string;
  private advicePrompt : string;
  private generalPrompt : string;



  constructor() {
    this.whatsappService = new WhatsAppService();
    this.userRepository = new UserRepository();
    this.ExpenseRepository = new ExpenseRepository();
    this.model = new AIModel();
    this.userRes = new userResponses();
    this.intentPrompt = formatIntentPrompt();
    this.advicePrompt = formatAdvicePrompt();
    this.generalPrompt = formatAIConfigPrompt();
  }

  operationsPath = async (aiResponse: AIResponse, user:User): Promise<string> => {
    
    let msg = '';

    if(aiResponse.function === 'create_expense') {
        await this.ExpenseRepository.createExpense(user.id,aiResponse);
        msg = this.userRes.expenseCreated(aiResponse.args.amount, aiResponse.args.category,aiResponse.args.date,aiResponse.args.description);
      }
      
      else if(aiResponse.function === 'get_category_spending') {
        const categorySpending = await this.ExpenseRepository.get_category_spending(user.id,aiResponse);
        msg = this.userRes.monthlyByCategory(months[aiResponse.args.period],categorySpending.total,categorySpending.result);
      }
      
      else if(aiResponse.function === 'get_days_spending_month') {
        const expensesofMonth = await this.ExpenseRepository.get_days_spending_month(user.id,aiResponse);
        msg = this.userRes.monthlySummary(months[aiResponse.args.period], expensesofMonth.total, expensesofMonth.data);
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
    msg = await this.model.getAIResponse(JSON.stringify(last2monthsExpenses), this.advicePrompt);
  
    return msg;

  }
  

  handleMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('WhatsApp webhook received:', JSON.stringify(req.body, null, 2));

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
        number_id: value.metadata.phone_number_id,
        number_name: value.contacts?.[0]?.profile?.name ?? '',
        number: message.from,
        timestamp: message.timestamp,
        body: message.text?.body ?? '',
      };

      const user = await this.userRepository.findOrCreate({
        phoneNumber: payload.number,
        name: payload.number_name,
        number_id: payload.number_id,
        timestamp: payload.timestamp,
        email: '',
      });

      //Decision if its is an advice or an operation
      let aiResponse = await this.model.getAIResponse(payload.body, this.intentPrompt);
      console.log('Intent AI response:', aiResponse);

      if (aiResponse.type === 'advice') {
        msg = await this.advicePath(aiResponse,user);
      }
      else if(aiResponse.type === 'operation'){
        msg = await this.operationsPath(aiResponse,user);
      }

      if (!msg) {
        msg = aiResponse.user_reply || this.userRes.generalError();
      }

      const data = true;
      // const data = await this.whatsappService.sendMessage(payload.number, msg);
      if(data) {
        res.status(200).json({ received: true, toSend: msg});
      } else {
        res.status(500).json({ received: false, error: 'Failed to send message' });
      }
    } catch (error) {
      res.status(500).json(error);
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


}
