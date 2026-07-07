import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller('orders')
export class OrdersController {
    @MessagePattern("create_order")
    createOrder(order:any){
        return {message: "Order Created", order}
    }
}
