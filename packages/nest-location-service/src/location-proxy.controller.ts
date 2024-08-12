import { BadRequestException, Body, Controller, Delete, Get, HttpStatus, Inject, Logger, NotFoundException, Param, Post, Put, Query } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import {
  CREATE_LOCATION,
  DELETE_LOCATION,
  FORCE_DELETE_LOCATION,
  FORCE_UPDATE_LOCATION,
  GET_ALL_LOCATION,
  GET_LOCATION,
  LOCATION_MICROSERVICE,
  UPDATE_LOCATION,
} from "./location.module-definition";
import { firstValueFrom } from "rxjs";
import { ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CreateLocationDto } from "./dto/create-location.dto";
import { createLocationSchemaType, updateLocationSchemaType } from "@cybermax-test-1/validator";
import { ResponseDto } from "./dto/response.dto";
import { UpdateLocationDto } from "./dto/update-location.dto";
import { GetAllLocationResDto } from "./dto/get-all-location-res.dto";
import { GetLocationResDto } from "./dto/get-location-res.dto";

@ApiTags('locations')
@Controller("location")
export class LocationProxyController {
  constructor(
    @Inject(LOCATION_MICROSERVICE)
    private readonly locationClient: ClientProxy,
    private readonly logger: Logger,
  ) {}
  CONTROLLER = 'LocationProxyController';
  
  async validateLocationExists(id: string){
    this.logger.log(`${this.CONTROLLER} - validateLocationExists: validation location exists id = ${id}`, this.CONTROLLER);

    if(isNaN(Number(id))) {
      this.logger.error(`${this.CONTROLLER} - validateLocationExists: Location with id = ${id} not found`, undefined, this.CONTROLLER);
      throw new NotFoundException(`Location with id = ${id} not found`)
    }
    const locationRes = await firstValueFrom(this.locationClient.send<GetLocationResDto, number>({ cmd: GET_LOCATION }, Number(id)))
    if(locationRes.status === HttpStatus.NOT_FOUND){
      this.logger.error(`${this.CONTROLLER} - validateLocationExists: ${locationRes.message}`, undefined, this.CONTROLLER);
      throw new NotFoundException(locationRes.message)
    }
    return locationRes
  }
  @ApiOkResponse({
    description: 'Successful response with a list of Locations',
    type: GetAllLocationResDto,
  })
  @Get()
  getAll(): Promise<GetAllLocationResDto> {
    this.logger.log(`${this.CONTROLLER} - getAll: Request get all locations`, this.CONTROLLER);

    this.logger.log(`${this.CONTROLLER}: Send {} to microservice ${GET_ALL_LOCATION}`, this.CONTROLLER);
    return firstValueFrom(
      this.locationClient.send<GetAllLocationResDto, object>({ cmd: GET_ALL_LOCATION }, {})
    )
  }
  @ApiOkResponse({
    description: 'Successful delete location',
    type: ResponseDto,
  })
  @Delete(':id')
  @ApiQuery({
    name: 'force',
    type: Boolean,
    description: 'Set true to delete location with children',
    required: false,
    example: false,
  })
  async delete(
    @Param('id') id: string,
    @Query('force') force = 'false'
  ) {
    this.logger.log(`${this.CONTROLLER} - delete: delete location id=${id} with force=${force}`, this.CONTROLLER);
    console.log(force ? FORCE_DELETE_LOCATION : DELETE_LOCATION)
    console.log(typeof force)
    await this.validateLocationExists(id)
    return firstValueFrom(
      this.locationClient.send<ResponseDto, number>(
        { cmd: force === 'true' ? FORCE_DELETE_LOCATION : DELETE_LOCATION }, 
        Number(id)
      )
    )
  }
  @ApiOkResponse({
    description: 'Successful response with a location',
    type: GetLocationResDto,
  })
  @Get(':id')
  async get(@Param('id') id: string): Promise<GetLocationResDto> {
    this.logger.log(`${this.CONTROLLER} - get: get location id=${id}`, this.CONTROLLER);

    const locationRes = await this.validateLocationExists(id)
    return locationRes
  }
  @ApiOkResponse({
    description: 'Successful create location',
    type: ResponseDto,
  })
  @Post()
  async create(@Body() input: CreateLocationDto) {
    this.logger.log(`${this.CONTROLLER} - create: create location input=${JSON.stringify(input)}`, this.CONTROLLER);

    const createLocationRes = await firstValueFrom(
      this.locationClient.send<ResponseDto, createLocationSchemaType>({ cmd: CREATE_LOCATION }, input)
    )
    if(createLocationRes.status === HttpStatus.BAD_REQUEST){
      throw new BadRequestException(createLocationRes.message)
    }

    return createLocationRes
  }
  @ApiOkResponse({
    description: 'Successful update location',
    type: ResponseDto,
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() {force, ...input}: UpdateLocationDto
  ) {
    this.logger.log(`${this.CONTROLLER} - update: update location input=${JSON.stringify(input)} with force=${force}`, this.CONTROLLER);
    await this.validateLocationExists(id)
    const updateLocationRes = await firstValueFrom(
      this.locationClient
        .send<ResponseDto, updateLocationSchemaType & { id: number }>(
          { cmd: force ? FORCE_UPDATE_LOCATION : UPDATE_LOCATION }, 
          {...input, id: Number(id)}
        )
    )
    if(updateLocationRes.status === HttpStatus.BAD_REQUEST){
      throw new BadRequestException(updateLocationRes.message)
    }

    return updateLocationRes
  }
}
