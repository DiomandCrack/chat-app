import React ,{Component}from 'react'
import _ from 'lodash'
import defaultAvatar from './files/img/avatar.png'
import UserForm from './UserForm'
import UserMenu from './UserMenu'

export default class UserBar extends Component {
state={
    showLoginForm:false,
    showMyAccount:false,
}
handleShowLoginForm=(e,isShown)=>{
    console.log('login form',e.target)
    this.setState({
        showLoginForm:isShown
    })
}
handleShowAccount=(e,isShown)=>{
    this.setState({
        showMyAccount:isShown
    })
}
render(){
    const {store} = this.props;
    const me = store.getCurrentUser()
    // console.log(me)
    const isConnected = store.isConnected();
    const avatar = _.get(me,'avatar')
    const {showLoginForm,showMyAccount} = this.state
    return(

        <div className='user-bar'>
            {me && !isConnected ? <div className='app-warning-state'>Reconnecting</div>:null}
            {me?
            (
                <div className='user-info' onClick={(e)=>this.handleShowAccount(e,true)}>
                    <div className='avatar'>
                        <img src={avatar?avatar:defaultAvatar} alt=""/>
                    </div>
                    <div className='name'>
                        {_.get(me,'name')}
                    </div>
                </div>
            ):
            (
                <button 
                    type='button' 
                    className="login-btn"
                    onClick={(e)=>this.handleShowLoginForm(e,true)}>Sign In</button>
            )}
            {!me && showLoginForm ?<UserForm store={store} onShowLoginForm={this.handleShowLoginForm}/>:null}
            {me && showMyAccount ?<UserMenu store={store} onShowAccount = {this.handleShowAccount}/>:null}
        </div>
    )
}
}