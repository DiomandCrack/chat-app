import React,{Component} from 'react'
import Messenger from './Messenger'
import Store from '../store'
export default class App extends Component {
    state={
        store:new Store(this)
    }
    render(){
        const {store} = this.state
        return(
            <div className='app'>
                <Messenger store={store}/>
            </div>
        )
    }
} 