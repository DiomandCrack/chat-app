import React, { Component } from 'react'

export default class UserMenu extends Component {
    handleOnSignOut=(e)=>{
        const {store}=this.props
        store.signOut()
        if(this.props.onShowAccount){
            this.props.onShowAccount(e,false)
        }
    }
    onClickOutside=(e)=>{
        if(this.menu && !this.menu.contains(e.target)){
            console.log('mouse is outside')
            this.props.onShowAccount(e,false)
        }
    }
    componentDidMount(){
        window.addEventListener('mousedown',this.onClickOutside)
    }
    componentWillUnmount(){
        window.removeEventListener('mousedown',this.onClickOutside)
    }
    render() {
        return (
            <div className="user-menu" ref={(menu)=>this.menu=menu}>
                <h3>我的账户</h3>
                <ul className='menu'>
                    <li>
                        <button type='button'>
                            个人资料
                        </button>
                    </li>
                    <li>
                        <button>
                            更改密码
                        </button>
                    </li>
                    <li>
                        <button onClick={(e)=>this.handleOnSignOut(e)}>
                            退出
                        </button>
                    </li>
                </ul>
            </div>
        )
    }
}