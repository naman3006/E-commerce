import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../common/interfaces/user.interface'; // Interface
import { Public } from '../../common/decorators/public.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('initiate')
  initiate(
    @Body() initiatePaymentDto: InitiatePaymentDto,
    @CurrentUser() user: User,
  ) {
    return this.paymentsService.initiate(initiatePaymentDto.orderId, user.id);
  }

  @Public()
  @Post('verify')
  verify(@Body() verifyPaymentDto: VerifyPaymentDto) {
    return this.paymentsService.verify(verifyPaymentDto);
  }

  @Get('order/:id')
  getStatus(@Param('id') orderId: string, @CurrentUser() user: User) {
    return this.paymentsService.getStatus(orderId, user.id);
  }
}
