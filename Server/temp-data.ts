import {Ticket} from '../client/src/api';

const data = require('./data.json');
 
export const tempData = data as Ticket[];

export type ResPonse = {tickets:Ticket[],length:number}
