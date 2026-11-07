import { Gift } from "./gift.model"
import { User } from "./user.model"

export class Ticket{
    id!:number
    buyer!:User
    gift!:Gift
    isPaid:boolean=false
    amount!:number
    paidDate?:Date
}