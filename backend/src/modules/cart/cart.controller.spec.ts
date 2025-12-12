import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

describe('CartController', () => {
  let controller: CartController;
  let cartService: CartService;

  const mockCartService = {
    findOne: jest.fn(),
    add: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: mockCartService,
        },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
    cartService = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('admin routes', () => {
    it('should get a cart by userId', async () => {
      const userId = 'user123';
      await controller.getCartByUserId(userId);
      expect(cartService.findOne).toHaveBeenCalledWith(userId, 'user');
    });

    it('should clear a cart by userId', async () => {
      const userId = 'user123';
      await controller.clearCartByUserId(userId);
      expect(cartService.clear).toHaveBeenCalledWith(userId);
    });
  });
});
