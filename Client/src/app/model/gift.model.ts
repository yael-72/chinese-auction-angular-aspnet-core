import { Catergory } from "./category.model"
import { Donor } from "./donor.model"

export class Gift{
    id:number = 0
    name!:string
    description:string = ''
    donor!:Donor
    donorId!:number
    category!:Catergory
    categoryId!:number
    price:number = 0
    image!:string
    winnerId?:number|null = null
}