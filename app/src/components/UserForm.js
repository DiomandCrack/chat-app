import React,{Component} from 'react'
import _ from 'lodash'

export default class UserForm extends Component {
    state={
        user:{
            email:'',
            password:'',
        }
    }
    handleOnSubmit=(e)=>{
        e.preventDefault()
        const {store} = this.props
        const {user} = this.state
        const email=_.get(user,'email')
        const password = _.get(user,'password')
        if( email && password){
            store.login(email,password)
        }
        console.log('submitted user',user)
    }

    onTextChange=(e)=>{
        let {user} = this.state
        const field = e.target.name
        user[field] = e.target.value
        this.setState({
            user:user
        })
    }

    render(){
        const {user} = this.state
        return(
            <div className='user-form'>
                <form onSubmit={this.handleOnSubmit} method = 'post'>
                    <div className='form-item'>
                        <label htmlFor="emlai">Email</label>
                        <input 
                            type="email"     
                            placeholder="email" 
                            name="email"
                            onChange={this.onTextChange}
                            value={_.get(user,'email')}
                        />
                    </div>

                    <div className='form-item'>
                        <label htmlFor="emlai">password</label>
                        <input 
                            type="password"     
                            placeholder="password" 
                            name="password"
                            onChange={this.onTextChange}
                            value={_.get(user,'password')}
                        />
                    </div>
                    <div className='form-actions'>
                        <button type='button'>Create an account</button>
                        <button type='submit'>Sign In</button>
                    </div>
                </form>
            </div>
        )
    }
}