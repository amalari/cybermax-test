import { Controller, HttpException, HttpStatus, Logger, NotFoundException } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { InsertLocationServiceInput, LocationService } from "./location.service";
import { CREATE_LOCATION, DELETE_LOCATION, FORCE_DELETE_LOCATION, FORCE_UPDATE_LOCATION, GET_ALL_LOCATION, GET_LOCATION, UPDATE_LOCATION } from "./location.module-definition";
import { createLocationSchemaType, updateLocationSchemaType } from "@cybermax-test-1/validator";
import { ResponseDto } from "./dto/response.dto";

@Controller()
export class LocationController {
  constructor(
    private readonly locationService: LocationService,
    private readonly logger: Logger
  ) {}

  CONTROLLER = 'LocationController';
  private async upsertValidate(input: updateLocationSchemaType | createLocationSchemaType){
    const locationNumberSplitted = input.number.split("-")
    const inputCreateLocation: InsertLocationServiceInput = {
      ...input,
      building: locationNumberSplitted[0],
      level: 0,
      area: String(input.area),
    }
    if(locationNumberSplitted.length > 2){
      const parentLocationNumber = locationNumberSplitted.slice(0, locationNumberSplitted.length - 1).join('-')
      const parentLocation = await this.locationService.findByLocationNumber(parentLocationNumber)

      if(!parentLocation) {
        throw new NotFoundException(
          `Location '${parentLocationNumber}' not found, please create location with location number '${parentLocationNumber}' first`
        )
      }
      
      inputCreateLocation.level = parentLocation.level + 1
      inputCreateLocation.parentId = parentLocation.id
    }
    return inputCreateLocation
  }

  @MessagePattern({ cmd: GET_ALL_LOCATION })
  async getAllLocation(@Payload() input: unknown) {
    this.logger.log(`${this.CONTROLLER} - ${GET_ALL_LOCATION}: Get input data ${JSON.stringify(input)}`, this.CONTROLLER)
    const data = await this.locationService.findAll()

    const response = {
      status: HttpStatus.OK,
      message: "List of locations",
      data
    } 
    this.logger.log(`${this.CONTROLLER} - ${GET_ALL_LOCATION}: Send response data ${JSON.stringify(response)}`, this.CONTROLLER)

    return response
  }
  @MessagePattern({ cmd: GET_LOCATION })
  async getLocation(@Payload() id: number) {
    this.logger.log(`${this.CONTROLLER} - ${GET_LOCATION}: Get input data ${JSON.stringify(id)}`, this.CONTROLLER)
    const location = await this.locationService.findById(id)
    let response: ResponseDto<typeof location>;
    if(!location){
      response = {
        status: HttpStatus.NOT_FOUND,
        message: `Location id=${id} not found`
      }
      this.logger.error(`${this.CONTROLLER} - ${GET_LOCATION}: Send response data ${JSON.stringify(response)}`, undefined, this.CONTROLLER)
      return response
    }
    response = {
      status: HttpStatus.OK,
      message: `Location id=${id} found`,
      data: location
    }

    this.logger.log(`${this.CONTROLLER} - ${GET_LOCATION}: Send response data ${JSON.stringify(response)}`, this.CONTROLLER)
    return response
  }
  @MessagePattern({ cmd: DELETE_LOCATION })
  async deleteLocation(@Payload() id: number) {
    this.logger.log(`${this.CONTROLLER} - ${DELETE_LOCATION}: input data ${JSON.stringify(id)}`, this.CONTROLLER)

    const locationHasChildren = await this.locationService.hasChildren(id)
    let response: ResponseDto;
    if(locationHasChildren){
      response = {
        status: HttpStatus.CONFLICT,
        message: `Conflict: Location id=${id} has child data, set query string force=true to force delete`
      }
      this.logger.error(`${this.CONTROLLER} - ${DELETE_LOCATION}: Send response data ${JSON.stringify(response)}`, undefined, this.CONTROLLER)
      return response
    }
    const deletedLocation = await this.locationService.delete(id)
    if(!deletedLocation){
      response = {
        status: HttpStatus.NOT_FOUND,
        message: `Location id=${id} not found`
      }
      this.logger.error(`${this.CONTROLLER} - ${DELETE_LOCATION}: Send response data ${JSON.stringify(response)}`, undefined, this.CONTROLLER)
      return response
    }
    response = {
      status: HttpStatus.OK,
      message: `Location id=${id} deleted`,
    }
    this.logger.log(`${this.CONTROLLER} - ${DELETE_LOCATION}: Send response data ${JSON.stringify(response)}`, this.CONTROLLER)
    return response
  }
  @MessagePattern({ cmd: FORCE_DELETE_LOCATION })
  async forceDeleteLocation(@Payload() id: number) {
    this.logger.log(`${this.CONTROLLER} - ${FORCE_DELETE_LOCATION}: input data ${JSON.stringify(id)}`, this.CONTROLLER)

    let response: ResponseDto;
    const deletedLocation = await this.locationService.delete(id)
    
    if(!deletedLocation){
      response = {
        status: HttpStatus.NOT_FOUND,
        message: `Location id=${id} not found`
      }
      this.logger.error(`${this.CONTROLLER} - ${FORCE_DELETE_LOCATION}: Send response data ${JSON.stringify(response)}`, undefined, this.CONTROLLER)
      return response  
    }
    response = {
      status: HttpStatus.OK,
      message: `Location id=${id} deleted`,
    } 
    this.logger.log(`${this.CONTROLLER} - ${FORCE_DELETE_LOCATION}: Send response data ${JSON.stringify(response)}`, this.CONTROLLER)
    return response
  }
  @MessagePattern({ cmd: CREATE_LOCATION })
  async createLocation(@Payload() input: createLocationSchemaType) {
    this.logger.log(`${this.CONTROLLER} - ${CREATE_LOCATION}: input data ${JSON.stringify(input)}`, this.CONTROLLER)
    let response: ResponseDto;
    try {
      const inputCreateLocation = await this.upsertValidate(input)
      await this.locationService.upsert(inputCreateLocation);
      response = {
        status: HttpStatus.OK,
        message: 'Location created'
      }
      this.logger.log(`${this.CONTROLLER} - ${CREATE_LOCATION}: Send response data ${JSON.stringify(response)}`, this.CONTROLLER)
      return response
    } catch (error: unknown) {
      let status = HttpStatus.BAD_REQUEST
      if(error instanceof NotFoundException){
        status = HttpStatus.NOT_FOUND
      }
      response = {
        status,
        message: (error as HttpException).message
      }
      this.logger.error(`${this.CONTROLLER} - ${CREATE_LOCATION}: Send response data ${JSON.stringify(response)}`, undefined, this.CONTROLLER)
      return response
    }
  }

  @MessagePattern({ cmd: UPDATE_LOCATION })
  async updateLocation(@Payload() input: updateLocationSchemaType & { id: number }) {
    this.logger.log(`${this.CONTROLLER} - ${UPDATE_LOCATION}: input data ${JSON.stringify(input)}`, this.CONTROLLER)
    let response: ResponseDto;

    try {
      const inputCreateLocation = await this.upsertValidate(input)
      const locationHasChildren = await this.locationService.hasChildren(input.id)
      if(locationHasChildren){
        response = {
          status: HttpStatus.CONFLICT,
          message: `Conflict: Location id=${input.id} has child data, set data force=true to force delete`
        }
        this.logger.error(`${this.CONTROLLER} - ${UPDATE_LOCATION}: Send response data ${JSON.stringify(response)}`, undefined, this.CONTROLLER)
        return response  
      }
  
      await this.locationService.upsert(inputCreateLocation);
      response = {
        status: HttpStatus.OK,
        message: 'Location updated'
      }
      this.logger.log(`${this.CONTROLLER} - ${UPDATE_LOCATION}: Send response data ${JSON.stringify(response)}`, this.CONTROLLER)
      return response
    } catch (error: unknown) {
      let status = HttpStatus.BAD_REQUEST
      if(error instanceof NotFoundException){
        status = HttpStatus.NOT_FOUND
      }
      response = {
        status,
        message: (error as HttpException).message
      }
      this.logger.error(`${this.CONTROLLER} - ${CREATE_LOCATION}: Send response data ${JSON.stringify(response)}`, undefined, this.CONTROLLER)
      return response

    }
  }
  @MessagePattern({ cmd: FORCE_UPDATE_LOCATION })
  async forceUpdateLocation(@Payload() input: updateLocationSchemaType & { id: number }) {
    let response: ResponseDto;

    try {
      const inputUpdateLocation = await this.upsertValidate(input)
      const locationWithChildren = await this.locationService.findByIdWithRelations(input.id)
      const oldLocationNumber = locationWithChildren?.number
      const flattenLocations = (location: typeof locationWithChildren) => {
        const { children, ...rest} = location!;
        const flattened: (Omit<typeof locationWithChildren, 'children'>)[] = [rest];
      
        if (children) {
          children.forEach((child) => {
            console.log({ oldLocationNumber, number: input.number })
            console.log(child.number.replace(oldLocationNumber!, input.number))
            flattened.push(...flattenLocations({
              ...child, 
              number: child.number.replace(oldLocationNumber!, input.number)
            } as any));
          });
        }
      
        return flattened;
      }
      const inputWithRelations = flattenLocations(locationWithChildren)
      await this.locationService.upsert(inputUpdateLocation);
      inputWithRelations.splice(0, 1)
      await this.locationService.bulkUpdateLocationAreas(inputWithRelations as InsertLocationServiceInput[])
      response = {
        status: HttpStatus.OK,
        message: 'Location updated'
      }
      this.logger.log(`${this.CONTROLLER} - ${UPDATE_LOCATION}: Send response data ${JSON.stringify(response)}`, this.CONTROLLER)
      return response
    } catch (error: unknown) {
      let status = HttpStatus.BAD_REQUEST
      if(error instanceof NotFoundException){
        status = HttpStatus.NOT_FOUND
      }
      response = {
        status,
        message: (error as HttpException).message
      }
      this.logger.error(`${this.CONTROLLER} - ${UPDATE_LOCATION}: Send response data ${JSON.stringify(response)}`, undefined, this.CONTROLLER)
      return response  
    }
  }
}
