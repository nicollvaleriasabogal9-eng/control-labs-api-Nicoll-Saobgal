import { Router } from 'express';
import { EnvironmentController } from '../controllers/ambientes.controller';
import { validateEnvironmentPayload } from '../middlewares/validateAmbiente.middleware';

const router = Router();

router.get('/', EnvironmentController.getEnvironments);
router.post('/', validateEnvironmentPayload, EnvironmentController.createEnvironment);

export default router;

