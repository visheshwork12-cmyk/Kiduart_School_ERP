import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morganMiddleware from '#config/morgan.js';
import routes from '#routes/index.js';
import { errorMiddleware } from '#middleware/error.middleware.js';
import { setupSwagger } from '#docs/swagger.js';
import passport from '#config/passport.js';
import config from '#config/index.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.NODE_ENV === 'production' ? config.baseUrl : '*' }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware);
app.use(passport.initialize());

setupSwagger(app);

app.use('/api/v1', routes);

app.use(errorMiddleware);

export default app;