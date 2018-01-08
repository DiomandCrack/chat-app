import React, { Component } from 'react'
import _ from 'lodash'

export default class SearchUser extends Component {

    render(){
        const { store , search } = this.props;
        const users = store.searchUsers(search);
        const usersList = users.map((user,i)=>(
            <li className='user' key={_.get(user,'_id')}>
                <img src={_.get(user,'avatar')} alt=""/>
                <div className='name'>{_.get(user,'name')}</div>
            </li>
        ))
        return(
            <div className='search-user'>
                <ul className='user-list'>
                    {usersList}
                </ul>
            </div>
        )
    }
}