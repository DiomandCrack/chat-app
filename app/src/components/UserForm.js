import React,{Component} from 'react'
import _ from 'lodash'
import classNames from 'classnames'

export default class UserForm extends Component {
    state={
        message:null,
        isLogin:true,
        user:{
            name:'',
            email:'',
            password:'',
        }
    }
    onClickOutside=(e)=>{
        if(this.form && !this.form.contains(e.target)){
            // console.log('mouse is outside')
            this.props.onShowLoginForm(e,false)
        }
    }
    componentDidMount(){
        window.addEventListener('mousedown',this.onClickOutside)
    }
    componentWillUnmount(){
        window.removeEventListener('mousedown',this.onClickOutside)
    }
    handleOnSubmit=(e)=>{
        e.preventDefault()
        const {store} = this.props
        const {user,isLogin} = this.state
        const email=_.get(user,'email')
        const password = _.get(user,'password')
        this.setState({
            message:null,
        },()=>{
            if( isLogin && email && password){
            store.login(email,password).then((user)=>{
                if(this.props.onShowLoginForm){
                    this.props.onShowLoginForm(e,false)
                }
            }).catch(err=>{
                console.log(err)
                this.setState({
                    message:{
                        main:err,
                        type:'error'
                    }
                })
            })
        }else{
            store.register(user).then(()=>{
                this.setState({
                    message:{
                        main:'注册成功',
                        type:'success'
                    }
                },()=>{
                    //login this user
                    store.login(_.get(user,'email'),_.get(user,'password')).then(()=>{
                        if(this.props.onShowLoginForm){
                            this.props.onShowLoginForm(e,false);
                        }
                    })
                })

            }).catch();
        }
        })
     
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
        const {message}=this.state
        const {user} = this.state
        const {isLogin} = this.state
        return(
            <div className='user-form' ref={(form)=>{
                this.form = form
            }}>
                <form onSubmit={this.handleOnSubmit} method = 'post'>
                {message?<p className={classNames('login-message',
                            _.get(message,'type')
                        )}>{_.get(message,'main')}</p>:<div className='space'></div>}
                    {!isLogin?<div className='form-item'>
                        <label htmlFor="name">昵称</label>
                        <input 
                            type="text"
                            placeholder="昵称"
                            name="name"
                            onChange={this.onTextChange}
                        />
                        </div>
                        :null}

                    <div className='form-item'>
                        <label htmlFor="email">邮箱</label>
                        <input 
                            type="email"     
                            placeholder="邮箱" 
                            name="email"
                            onChange={this.onTextChange}
                            value={_.get(user,'email')}
                        />
                    </div>

                    <div className='form-item'>
                        <label htmlFor="password">密码</label>
                        <input 
                            type="password"     
                            placeholder="密码" 
                            name="password"
                            onChange={this.onTextChange}
                            value={_.get(user,'password')}
                        />
                    </div>
                    <div className='form-actions'>
                        {
                            isLogin?<button type='button' onClick={
                        ()=>{
                            this.setState({
                                isLogin:false,
                            })
                        }
                        }>Create an account</button>:null}
                        <button type='submit'>{isLogin?'登陆':'注册'}</button>
                    </div>
                </form>
            </div>
        )
    }
}