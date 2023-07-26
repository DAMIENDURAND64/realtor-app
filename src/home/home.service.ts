import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dto/home.dto';
import { PropertyType } from '@prisma/client';
import { UserInfo } from 'src/user/interceptors/user.interceptor';

interface GetHomesParam {
  city?: string;
  price?: {
    gte?: number;
    lte?: number;
  };
  propretyType?: PropertyType;
}

interface CreateHomeParam {
  address: string;
  city: string;
  price: number;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  propertyType: PropertyType;
  landSize: number;
  image: { url: string }[];
}

interface UpdateHomeParam {
  address?: string;
  city?: string;
  price?: number;
  numberOfBedrooms?: number;
  numberOfBathrooms?: number;
  propertyType?: PropertyType;
  landSize?: number;
}

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}
  async getHomes(filters: GetHomesParam): Promise<HomeResponseDto[]> {
    const homes = this.prismaService.home.findMany({
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        propertyType: true,
        number_of_bedrooms: true,
        number_of_bathrooms: true,
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
      where: filters,
    });

    if (!(await homes).length) {
      throw new NotFoundException('No homes found');
    }
    return (await homes).map((home) => {
      const fetchHome = { ...home, image: home.images[0].url };
      delete fetchHome.images;
      return new HomeResponseDto(fetchHome);
    });
  }

  async getHomeById(id: number): Promise<HomeResponseDto> {
    const home = await this.prismaService.home.findUnique({
      where: { id },
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        propertyType: true,
        number_of_bedrooms: true,
        number_of_bathrooms: true,
        images: {
          select: {
            url: true,
          },
        },
      },
    });

    if (!home) {
      throw new NotFoundException('Home not found');
    }

    const fetchHome = { ...home, image: home.images[0].url };
    delete fetchHome.images;
    return new HomeResponseDto(fetchHome);
  }

  async createHome(
    {
      address,
      city,
      image,
      landSize,
      numberOfBathrooms,
      numberOfBedrooms,
      price,
      propertyType,
    }: CreateHomeParam,
    userId: number,
  ) {
    const home = await this.prismaService.home.create({
      data: {
        address,
        number_of_bathrooms: numberOfBathrooms,
        number_of_bedrooms: numberOfBedrooms,
        city,
        price,
        propertyType,
        land_size: landSize,
        realtor_id: userId,
      },
    });

    const homeImages = image.map((img) => ({
      url: img.url,
      home_id: home.id,
    }));

    await this.prismaService.image.createMany({
      data: homeImages,
    });

    return new HomeResponseDto(home);
  }

  async updateHomeById(id: number, data: UpdateHomeParam) {
    const home = await this.prismaService.home.findUnique({
      where: { id },
    });

    if (!home) {
      throw new NotFoundException('Home not found');
    }

    const updatedHome = await this.prismaService.home.update({
      where: { id },
      data,
    });

    return new HomeResponseDto(updatedHome);
  }

  async deleteHomeById(id: number) {
    await this.prismaService.image.deleteMany({
      where: { home_id: id },
    });

    await this.prismaService.home.delete({
      where: { id },
    });
  }

  async getRealtorByHomeId(id: number) {
    const home = await this.prismaService.home.findUnique({
      where: { id },
      select: {
        realtor: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
      },
    });
    if (!home) {
      throw new NotFoundException('Home not found');
    }

    return home.realtor;
  }

  async inquire(buyer: UserInfo, homeId, message) {
    const realtor = await this.getRealtorByHomeId(homeId);

    return this.prismaService.message.create({
      data: {
        message,
        home_id: homeId,
        buyer_id: buyer.id,
        realtor_id: realtor.id,
      },
    });
  }

  async getHomeMessages(homeId: number) {
    return await this.prismaService.message.findMany({
      where: { home_id: homeId },
      select: {
        message: true,
        buyer: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
      },
    });
  }
}
