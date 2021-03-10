import React from 'react';
import './App.scss';
import {ResPonse} from '../../server/temp-data';
import {createApiClient, Ticket} from './api';
import { stringify } from 'querystring';
import { idText, isReturnStatement, NullLiteral, Scanner } from 'typescript';
import { nextTick } from 'process';
import { AnyARecord } from 'dns';
import { isNullOrUndefined } from 'util';

export type AppState = {
	tickets?: Ticket[],
	search: string,
	fontsize:string,
	see:boolean,
	pagesize:number,
	pagenum:number,
	hidennum:number,
	alltickts:number,
	boolhide:boolean,
	checkdate:any,
	sortway:string;
}

const api = createApiClient();

export class App extends React.PureComponent<{}, AppState> {

	state: AppState = {
		search: '',
		pagenum:1,
		fontsize:"2",
		hidennum:0,
		pagesize:20,
		alltickts:0,
		sortway:'',
		see:true,
		boolhide:true,
		checkdate:""
	};

	searchDebounce: any = null;

	async componentDidMount() {
		const resp: ResPonse = await api.getTickets(this.state.pagenum," ",this.state.pagesize,this.state.checkdate,"");
		resp.tickets.forEach((t)=>t.boolhide=true);
		this.setState({
			tickets: resp.tickets,
			alltickts:resp.length
		});
	}

	dorestore=async ()=>{
		const newlist = this.state.tickets?this.state.tickets.map((t)=>{t.boolhide=true;return t;}):[];
		this.setState({
			hidennum:0,
			tickets: newlist
		});
	}
	dohide = (ticket:Ticket)=>{
		ticket.boolhide=false;
		this.setState({boolhide:this.state.boolhide,
		hidennum:this.state.hidennum+1})
	}

	filtertic =(tickets:Ticket[],)=>{
		
		const checkifdate=(date:string)=>{
			if(isNaN(Date.parse(date))){
				return (Date.parse(date));
			}
				return 0;

		}


		if(this.state.search==""){
			return tickets.filter((t)=>t.boolhide==true).filter((t) => (t.title.toLowerCase() + t.content.toLowerCase()).includes(this.state.search.toLowerCase()));
		}
		let firstval;
		let serchval;
		let flag;
		if(this.state.search.includes(" ")){
			 serchval = this.state.search.split(" ");
			 firstval= serchval[0];
			 flag=0;
		}else{
			 serchval = this.state.search;
			 firstval= serchval;
			 flag=1;
		}
				if(firstval.includes(":")){
				const action=firstval.split(":");
				if(action.length>1){
					console.log(action[0]);
				if(action[0].toLowerCase()=="after"||action[0].toLowerCase()=="before"){
						const time =checkifdate(action[1]);
						if(time!=0){
							const i=2;
							var rest;
							if(serchval===[(""),(""),("")]){
							 rest = serchval[1] ;
							while(i<serchval.length){
								rest+=" "+serchval[i];
							}
						}else{ rest= serchval;}
							if(action[0].toLowerCase()=="after"){
								this.dosortplus('date',time,"");
							}else
							{
								this.dosortplus('date1',time,"");
							}

							console.log(rest, time);
							this.setState({	
								search:rest===""?rest:rest[0]
							})
						}

				}else if(action[0].toLowerCase()=="from"){
					if(action[1].includes("@")){
						this.dosortplus('mail',0,action[1]);
							const p=2;
							console.log(action[1]);
							var rest2 = serchval[1] ;
							while(p<serchval.length){
								rest2+=" "+serchval[p];
							}
							this.setState({
								checkdate:action[1],
								search:rest2
							})
					}


				}}}
				this.setState({
					checkdate:""
				})
				return tickets.filter((t)=>t.boolhide==true).filter((t) => (t.title.toLowerCase() + t.content.toLowerCase()).includes(this.state.search.toLowerCase()));
				
		
	}

	renderTickets = (tickets: Ticket[]) => {
		const size = this.state.fontsize;
		const filteredTickets =this.filtertic(tickets);


		return (<ul className='tickets' >
			{filteredTickets.map((ticket) => (
				<li key={ticket.id} className={"ticket"+size}>
				<h5 className='title'>{ticket.title}
				<button className='hidebutten' onClick={(e)=>this.dohide(ticket)}>Hide</button></h5>
				{this.show_content(ticket)}
				<footer>
					<div className='meta-data'>By {ticket.userEmail} | { new Date(ticket.creationTime).toLocaleString()}</div>
				</footer>
			</li>))}
		</ul>);
	}
	show_content = (ticket:Ticket)=>{

		const seecontent= (content1:string)=>{
			const lines = content1.split(".");
			const threelines= lines[0]+"."+ lines[1]+"."+lines[2]+".";
			const content2= ticket.see?content1:threelines;
			return <p className='content'>{content2}</p>;
			}
	

			const change_see=(ticket1:Ticket)=>{
				ticket1.see=!ticket1.see;
			 this.setState({see:!(this.state.see)});
			}
		return(
			<div>
			{seecontent(ticket.content)}
				<span><button className="seebutton" onClick={(e)=>{change_see(ticket)}}>{(ticket.see)?<span>See less</span>:<span>See more</span>}</button></span>
			</div>
		)

	}
	onSearch = async (val: string, _newPage?: number) => {
		
		clearTimeout(this.searchDebounce);

		this.searchDebounce = setTimeout(async () => {
			this.setState({
				search: val
			});

		}, 300);
	}
	textsizebuttons=()=>{

		const do_edit_textsize=(size:any)=>{
			this.setState({
				fontsize:size
			})
		}
	 
		
		return(<ul className="textsizebutton">select font size: 
		<li className= "sizebtm" >{this.state.fontsize=='1'?<button className ="b1">Small -</button>:<button className ="b1" onClick={(e)=>do_edit_textsize('1')}>Small -</button>}</li>
		<li className= "sizebtm">{this.state.fontsize=='2'?<button className ="b2">Normal -</button>:<button className ="b2" onClick={(e)=>do_edit_textsize('2')}>Normal -</button>}</li>	
		<li className= "sizebtm">{this.state.fontsize=='3'?<button className ="b3">Large</button>:<button className ="b3" onClick={(e)=>do_edit_textsize('3')}>Large</button>}</li>
		</ul>
		)
	
	}
	showingresults=(tickets: Ticket[])=>{
		
		return (<div className="results5" >
		{ (this.state.hidennum==0)?
		(<div className='results1'>  Showing {((this.state.pagenum-1)*this.state.pagesize)+1}-{tickets.length*this.state.pagenum} results from {this.state.alltickts} tickets</div>):
		 <div className='results1'>  Showing {((this.state.pagenum-1)*this.state.pagesize)+1}-{tickets.length*this.state.pagenum-this.state.hidennum} results from {this.state.alltickts} tickets({this.state.hidennum} hidden tickets-
		 <button className='restorebutten' onClick={this.dorestore}>Restore</button>)</div>}
	    <div className="checkk">{this.dopaging()}</div></div>)


	}
 
    dosortplus =async (sort_way:string,date:number,email:string)=>{
		const extraargs = (date==0)?email:date;
		console.log(this.state.pagenum,sort_way,this.state.pagesize,extraargs)
		const resp: ResPonse =await api.getTickets(this.state.pagenum,sort_way,this.state.pagesize,extraargs,"");
		resp.tickets.forEach((t)=>t.boolhide=true);
		this.setState({
			checkdate:extraargs,
			tickets:resp.tickets,
			sortway:sort_way,
			pagenum:1
		})

	}


	sortbutten=()=>{

		const dosort=async (sort_way:string)=>{
			const sort_w =(sort_way==this.state.sortway)?(sort_way+'1'):sort_way;
			const resp: ResPonse =await api.getTickets(this.state.pagenum,sort_w,this.state.pagesize,this.state.checkdate,"");
			resp.tickets.forEach((t)=>t.boolhide=true);
			this.setState({
				tickets:resp.tickets,
				sortway:sort_w,
				pagenum:1
			})

		}



		return(<ul className="sortbutton">Sort By:
		<li className="sortbtm" ><button onClick={(e)=>dosort('date')}>Date</button></li>
		<li className="sortbtm"><button  onClick={(e)=>dosort('title')}>Title</button></li>	
		<li className="sortbtm"><button onClick={(e)=>dosort('mail')}>Email</button></li>
		</ul>
		)

	}
	pagenumber=()=>{
		const edit_page_size=async(size:number)=>{
			const resp: ResPonse =await api.getTickets(this.state.pagenum,this.state.sortway,size,this.state.checkdate,"");
			resp.tickets.forEach((t)=>t.boolhide=true);
			this.setState({
				tickets:resp.tickets,
				pagesize:size,
				pagenum:1,
				hidennum:0
			})
		}
		return (
		<ul className="pagesizeb">Select amount of tickets: 
		<li className= "pages" >{this.state.pagesize==20?<button>20</button>:<button onClick={(e)=>edit_page_size(20)}>20</button>}</li>
		<li className= "pages">{this.state.pagesize==100?<button>100</button>:<button  onClick={(e)=>edit_page_size(100)}>100</button>}</li>	
		<li className= "pages">{this.state.pagesize==200?<button>200</button>:<button onClick={(e)=>edit_page_size(200)}>200</button>}</li>
		</ul>
		)


	}
	dopaging=()=>{

		const Uppage =async ()=>{
			const resp: ResPonse =await api.getTickets(this.state.pagenum+1,this.state.sortway,this.state.pagesize,this.state.checkdate,"");
			resp.tickets.forEach((t)=>t.boolhide=true);
			this.setState({
				tickets:resp.tickets,
				pagenum:this.state.pagenum+1,
				hidennum:0
			})

		}
		const Downpage =async()=>{
			const resp: ResPonse =await api.getTickets(this.state.pagenum-1,this.state.sortway,this.state.pagesize,this.state.checkdate,"");
			resp.tickets.forEach((t)=>t.boolhide=true);
			this.setState({
				tickets:resp.tickets,
				pagenum:this.state.pagenum-1
			})
		}


		return(
			<span className="pagesnumber">
			<li className="changepage">{this.state.pagenum==1?null:<button className="pagebutton" onClick={Downpage}> {this.state.pagenum-1} </button>}</li>
			<li className="changepage">{this.state.pagenum}</li>
			<li className="changepage">{this.state.pagenum+1>(this.state.alltickts/this.state.pagesize)?null:<button className="pagebutton" onClick={Uppage}> {this.state.pagenum+1} </button>}</li>
			</span>
		)


	}

	dosupersearch= async (val: string, _newPage?: number) => {
		
		clearTimeout(this.searchDebounce);

		this.searchDebounce = setTimeout(async () => {
			const resp: ResPonse = await api.getTickets(this.state.pagenum," ",this.state.pagesize,this.state.checkdate,val);
			resp.tickets.forEach((t)=>t.boolhide=true);
			this.setState({
			tickets: resp.tickets,
			alltickts:resp.length
		});

		}, 300);
	}
	render() {	
		const {tickets} = this.state;
		
		return (<main className="main">

			<h1>Ticketing system</h1>
			<ul className="buttons">
			{this.textsizebuttons()}
			{this.sortbutten()}
			{this.pagenumber()}
			</ul>
			<header>
				<input type="search" placeholder="SuperSearch..." onChange={(e) => this.dosupersearch(e.target.value)}/>
			</header>
			<header>
				<input type="search" placeholder="Search..." onChange={(e) => this.onSearch(e.target.value)}/>
			</header>
			{tickets? this.showingresults(tickets):null }

			{tickets ? this.renderTickets(tickets) : <h2>Loading..</h2>}
		</main>)
	}
}

export default App;