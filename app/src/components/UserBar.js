import React ,{Component}from 'react'
import _ from 'lodash'
import defaultAvatar from './files/img/avatar.png'
import UserForm from './UserForm'


export default class UserBar extends Component {
state={
    showLoginForm:false
}
handleShowLoginForm=(e,isShown)=>{
    console.log('login form',e.target)
    this.setState({
        showLoginForm:isShown
    })
}
render(){
    const {store} = this.props;
    const me = store.getCurrentUser()
    // console.log(me)
    const avatar = _.get(me,'avatar')
    const {showLoginForm} = this.state
    return(

        <div className='user-bar'>
            {me?
            (
                <div className='user-info'>
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
            
        </div>


    )
}
}