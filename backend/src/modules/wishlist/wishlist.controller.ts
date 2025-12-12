import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../common/interfaces/user.interface'; // Interface

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  findOne(@CurrentUser() user: User) {
    return this.wishlistService.findOne(user.id);
  }

  @Post('add/:productId')
  add(@Param('productId') productId: string, @CurrentUser() user: User) {
    return this.wishlistService.add(user.id, productId);
  }

  @Delete('remove/:productId')
  remove(@Param('productId') productId: string, @CurrentUser() user: User) {
    return this.wishlistService.remove(user.id, productId);
  }
}
