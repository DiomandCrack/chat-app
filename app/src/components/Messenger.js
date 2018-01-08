import React, {Component} from 'react'
import avatar from './files/img/avatar.png'
import classNames from 'classnames'
import {OrderedMap} from 'immutable'
import {ObjectID} from '../helpers/objectId'
import _ from 'lodash'
import SearchUser from './SearchUser'
import moment from 'moment'
export default class Messenger extends Component {
    state = {
        height: window.innerHeight,
        newMessage:'',
        searchUser:''
    }

    componentDidMount(){
        window.addEventListener('resize', this._onResize.bind(this))
        this.addMessage()
        this.addChannel()

    }

    componentWillUnmount(){
        window.removeEventListener('resize',this._onResize.bind(this))
    }
    componentDidUpdate(){
        console.log('component did update')
        this.scrollMessageToBottom()
        if(this.searchInput) this.searchInput.focus()
    }
    _onCreateChannerl(){
        const {store} = this.props;
        const channelId = ObjectID().toString()
        const channel = {
                _id: channelId,
                title:`Channel`,
                lastMessage:`hey`,
                avatar,
                members:new OrderedMap(),
                messages:new OrderedMap(),
                created:Date.now(),
                isNew:true,
            }
        store.onCreateNewChannel(channel)
        store.setActiveChannelId(channelId)
    }
    _onResize(){
        this.setState({
            height:window.innerHeight
        })
    }

    addChannel(){
        const {store} = this.props
                //create test channel
        for(let i=0; i<10; i++){
            let newChannel = {
                _id: `${i}`,
                title:`Channel title ${i}`,
                lastMessage:`hey there...${i}`,
                avatar,
                members:new OrderedMap({
                    '1':true,
                    '2':true,
                    '3':true,
                }),
                messages:new OrderedMap(),
                created: Date.now(),
            }
            newChannel.messages = newChannel.messages.set(`${i}`,true);
            newChannel.messages = newChannel.messages.set(`${i+4}`,true);
            newChannel.messages = newChannel.messages.set(`${i+3}`,true);
            store.addChannel(i,newChannel)
        }

    }
    addMessage(){
        const {store} = this.props

        //create test messages
        for(let i=0; i<100;i++){
            let isMe = false;
            if(i%3===0) isMe = true;
            const newMsg={
                _id:`${i}`,
                author:`Author${i}`,
                main: `the body of message ${i}`,
                avatar:avatar,
                time: '2小时前',
                me:isMe
            }
            
            store.addMessage(i,newMsg);
            //new messages added but react won't re-render itself so i should use this.forceUpdate()
           
        }
        console.log(store);

    }
    handleSend(){
        const {newMessage} = this.state
        const {store} = this.props
        //creat new message
        
        const messageId = new ObjectID().toString();
        const channel = store.getActiveChannel()
        const channelId = _.get(channel,'_id',null);
        const currentUser = store.getCurrentUser();
        const message = {
            _id:messageId,
            main:newMessage,
            author: _.get(currentUser,'name',null),
            me: true,
            avatar,
            channelId,
            time: new Date().toTimeString().substr(0,8)
        };
        if(newMessage.trim().length) {
            store.addMessage(messageId,message)
        }
        this.setState({
                newMessage:''
        })
    }

    renderMessage(message){
        const text = _.get(message,'main','')
        const html = _.split(text,'\n').map((item,i)=>(
            <div dangerouslySetInnerHTML={{__html:item}} key={i} />)
        )
        return html
    }

    scrollMessageToBottom(){
        if(this.messagesRef) 
        {this.messagesRef.scrollTop = this.messagesRef.scrollHeight}
    }

    render(){
        const {store} = this.props;
        const {height} = this.state;
        const style={
            height:height
        }
        // console.log(this.props.store)
        const activeChannel = store.getActiveChannel()
        const messages = store.getMessagesFromChannel(activeChannel)
        const channels = store.getChannels()
        const members = store.getMembersFromChannel(activeChannel)
        
        console.log('activeChannel ',activeChannel)

        // console.log(messages,channels);
        const messagesList=messages.map((message,i) => (
            <div className={classNames('message',{'me':message.me})} key={i}>
                <div className='avatar'>
                    <img src={message.avatar} alt=""/>
                </div>
                <div className='message-main'>
                    <div className='message-info'>
                        <div className='message-author'>
                            {message.author}
                        </div>
                        <time className='send-time'>{message.time}</time>
                    </div>
                    <div className='message-text'>
                        <div>
                            {this.renderMessage(message)}
                        </div>
                    </div>
                </div>
            </div>
        ))
        const channelsList = channels.map((channel,i) => (
            <div className={classNames('channel',{'active':_.get(activeChannel,'_id')=== _.get(channel,'_id')})} 
                 key={channel._id} 
                 onClick={()=>{
                store.setActiveChannelId(channel._id)
            }}>
                <div className='channel-image'>
                    <img src={channel.avatar} alt=''/>
                </div>
                <div className='channel-info'>
                    <h2>{channel.title}</h2>
                    <p>{channel.lastMessage}</p>
                </div>
            </div>
        ))

        let membersList = members.map((member) => (
            <div className='member' key={member._id}>
                <div className='member-avatar'>
                    <img src={member.avatar} alt=''/>
                </div>
                <div className='member-info'>
                    <h2>{member.name}</h2>
                    <p>joined:{moment(member.created).fromNow()}</p>
                </div>
            </div>
        ))
        return(
            <div style={style} className='messenger'>
                <div className='header'>
                    <div className='left'>
                    <button className='left-action'>
                        <i className='icon-cog'/>
                    </button>
                    <button className='right-action' onClick={this._onCreateChannerl.bind(this)}>
                        <i className='icon-pencil-square-o'/>
                    </button>
                        <div className='actions'>
                            <button>Messenger</button>
                        </div>
                    </div>
                    
                       {_.get(activeChannel,'isNew')?
                       (<div className='content'>
                           <div className="toolbar">
                            <h2>{_.get(activeChannel,'title')}</h2>
                            <input type='text'
                                   value={this.state.searchUser}
                                   onChange={(e)=>{
                                this.setState({
                                    searchUser: _.get(e,'target.value')
                                })
                            }}
                                    ref={(input)=>this.searchInput = input}
                            />
                            </div>
                            <SearchUser search={this.state.searchUser} store={store}/>
                        </div>
                    ):
                        (<div className='content'>
                            <h2>{_.get(activeChannel,'title')}</h2>
                         </div>)
                    }
                    <div className='right'>
                        <div className='user-bar'>
                            <div className='name'>
                                DiamondCrack
                            </div>
                            <div className='avatar'>
                                <img src={avatar} alt=""/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='main'>
                    <div className='sidebar-left'>

                        <div className='channels'>
                            {channelsList}
                        </div>

                    </div>
                    <div className='content'>
                        <div className='messages-list' ref={(ref)=>this.messagesRef = ref}>
                        {messagesList}
                        </div>
                        <div className='messenger-input'>
                            <div className='text-input'>
                                <textarea 
                                    name="" 
                                    id="" 
                                    placeholder="Shift + enter send message"
                                    value={this.state.newMessage}
                                    onChange={(e)=>{
                                        this.setState({newMessage:_.get(e,'target.value')})
                                    }}
                                    onKeyUp={(e)=>{
                                        if(e.key === 'Enter' && e.shiftKey){
                                            this.handleSend();
                                        }
                                    }}
                                    ></textarea>
                            </div>
                            <div className='actions'>
                                <button className='send' onClick={this.handleSend.bind(this)}>Send</button>
                            </div>
                        </div>
                    </div>
                    <div className='sidebar-right'>
                        {members.length?(
                            <div>
                                <div className='title'>PEOPLE</div>
                                <div className='members'>
                                    {membersList}
                                </div>
                            </div>):
                        null
                        }
                        
                    </div>
                </div>
            </div>
        )
    }
} 