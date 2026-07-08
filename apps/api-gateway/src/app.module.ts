import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICES_CLIENTS } from './constants';
import { OrdersController } from './orders/orders.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICES_CLIENTS.USERS_SERVICE,
        transport: Transport.TCP,
        options:{
          host: process.env.USERS_SERVICE_HOST || 'localhost',
          port: 4003
        }
      },
      {
        name: MICROSERVICES_CLIENTS.ORDERS_SERVICE,
        transport: Transport.TCP,
        options:{
          host: process.env.ORDERS_SERVICE_HOST || 'localhost',
          port: 4001
        }
      },
      {
        name: MICROSERVICES_CLIENTS.PRODUCTS_SERVICE,
        transport: Transport.TCP,
        options:{
          host: process.env.PRODUCTS_SERVICE_HOST || 'localhost',
          port: 4002
        }
      }
    ])
  ],
  controllers: [AppController, OrdersController],
  providers: [AppService],
})
export class AppModule {}
