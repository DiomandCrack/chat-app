import React, { Component } from 'react'
import _ from 'lodash'

export default class SearchUser extends Component {
    handleOnClick(user){
        console.log(user.name)
        if(this.props.onSelect){
            this.props.onSelect(user)
        }
    }
    render(){
        const { store } = this.props;
        const users = store.getSearchUsers();
        const usersList = users.map((user,i)=>(
            <li
            onClick={()=>this.handleOnClick(user)} 
            className='user' key={_.get(user,'_id')}>
                <img src={_.get(user,'avatar')} alt=""/>
                <div className='name'>{_.get(user,'name')}</div>
            </li>
        ))
        return(
            <div 
            className='search-user'>
                <ul className='user-list'>
                    {usersList}
                </ul>
            </div>
        )
    }
}