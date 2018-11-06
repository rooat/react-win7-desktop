import React from 'react'
import style from './footerIcon.scss'
import classnames from 'classnames'
export default class FooterIcon extends React.Component {
    constructor(props){
        super(props);
        this.footerIconClick = this.footerIconClick.bind(this);
        this.iconMousedown = this.iconMousedown.bind(this);
        this.iconMouseup = this.iconMouseup.bind(this)
        this.state = {
            active: false
        }
    }
    footerIconClick(){
        this.props.footerIconClick(this.props.appItem.detail.appId)
    }
    iconMousedown(){
        this.setState({
            active: true
        })
        document.addEventListener('mouseup', this.iconMouseup)
    }
    iconMouseup(){
        this.setState({
            active: false
        })
        document.removeEventListener('mouseup', this.iconMouseup)
    }
    render() {
        return (
            <div onMouseDown={this.iconMousedown} className={classnames({[style['win-task-app']]: true, [style.down]: this.state.active})} onClick={this.footerIconClick}>
                <i style={{background: `-webkit-linear-gradient(top,rgba(255,255,255,1.2),rgba(255,255,255,0.9)) content-box,url(${this.props.appItem.detail.img}) no-repeat`}}></i>
                <div style={{backgroundImage: `url(${this.props.appItem.detail.img})`}} className={style['task-img']}></div>
            </div>
        )
    }
}