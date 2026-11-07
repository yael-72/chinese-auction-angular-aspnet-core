import { Gift } from "./gift.model"

export class Donor{
    id!:number
    name!:string
    email:string =''
    country:string=''
    phone:string = ''
    gifts:Gift[]=[]
}