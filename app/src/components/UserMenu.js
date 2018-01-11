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
                <h2>My account</h2>
                <ul className='menu'>
                    <li>
                        <button type='button'>
                            My profile
                        </button>
                    </li>
                    <li>
                        <button>
                            Change passWord
                        </button>
                    </li>
                    <li>
                        <button onClick={(e)=>this.handleOnSignOut(e)}>
                            Sign out
                        </button>
                    </li>
                </ul>
            </div>
        )
    }
}