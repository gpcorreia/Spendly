import { Router } from 'express';
import { WhatsAppController } from '../controllers/whatsapp';
import checkBackendRequest from '../middleware/checkBackendRequest';


const router = Router();
const whatsappController = new WhatsAppController();

router.get('/webhook', whatsappController.verifyWebhook);
router.post('/webhook', whatsappController.handleMessage);
router.post('/activate/:user_id',checkBackendRequest,whatsappController.firstMessage);

export default router;