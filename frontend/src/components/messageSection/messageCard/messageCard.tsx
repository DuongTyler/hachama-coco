import React from "react";
import CSS from 'csstype';
import classNames from 'classnames';
import handleViewport from 'react-in-viewport';
import {Region} from "../../../models/region";
import {Message} from "../../../models/message";
import {Animation} from "../../../models/animation";
import DisplayedLanguage from "../../../models/language";
import {ReactComponent as TranslateBotan} from "../../../assets/icons/translateIcon.svg";
import { Twemoji } from 'react-emoji-render';
import BaseCard, {BaseCardProps, BaseCardState} from "../../../shared/components/baseCard/baseCard";
import { ExternalLink, linkToString, stringToLink } from '../../../models/url';
import { Content } from '../../../models/content';

import "./messageCard.css";
import "../../gallery/artworkCard/artworkCard.css";
import '../../../shared/globalStyles/global.css'

interface MessageCardProps extends BaseCardProps<(Content)>{
}

interface MessageCardState extends BaseCardState{
}

function regionCodeToFlag(code: Region): string {
    // Offset between Latin uppercase A-Z and Regional Indicator Symbols A-Z
    const RI_OFFSET = 0x1F1A5;

    if (code.length !== 2) return "";

    let first = code.charCodeAt(0);
    if (first < 0x41 && first > 0x5A) return "";
    first += RI_OFFSET;

    let second = code.charCodeAt(1);
    if (second < 0x41 && second > 0x5A) return "";
    second += RI_OFFSET;

    return String.fromCodePoint(first, second);
}

export default class MessageCard extends BaseCard<Content, MessageCardProps, MessageCardState> {
    private readonly message: Content;
    private readonly flag: string;
    private readonly hasTlMsg: boolean;

    constructor(props: MessageCardProps) {
        super(props);
        this.message = props.object;
        if (props.object.region != undefined) {
            this.flag = regionCodeToFlag(props.object.region);
        } else {
            // TODO: Remove temp value
            this.flag = regionCodeToFlag("AQ");
        }
        if (this.message.tl_msg != undefined) {
            this.hasTlMsg = this.message.tl_msg.length > 0;
        } else {
            this.hasTlMsg = false;
        }
        this.toggleCurrentLanguage = this.toggleCurrentLanguage.bind(this);
    }
    private toggleCurrentLanguage(): void {
        this.setState((state: MessageCardState) => ({
            currentLanguage: state.currentLanguage === DisplayedLanguage.Original
                ? DisplayedLanguage.Japanese
                : DisplayedLanguage.Original
        }));
    }

    componentWillMount() {
        this.setState({
            currentLanguage: this.hasTlMsg ?  this.props.language : DisplayedLanguage.Original,
            globalLanguage: this.props.language
        });
    }

    componentDidUpdate() {
        if (this.state.globalLanguage !== this.props.language) {
            this.setState({
                currentLanguage: this.hasTlMsg ?  this.props.language : DisplayedLanguage.Original,
                globalLanguage: this.props.language
            });
        }
    }

    renderMessage() {
        return (
            <div>
                <div className="message-card-text-container">
                    <div className={classNames("message-card-text", {
                        "active-message": this.state.currentLanguage === DisplayedLanguage.Original,
                    })}>
                        <div>{this.message.orig_msg}</div>
                    </div>
                    {this.hasTlMsg &&
                    <div className={classNames("message-card-text", {
                        "active-message": this.state.currentLanguage === DisplayedLanguage.Japanese,
                    })}>
                        <div>{this.message.tl_msg}</div>
                    </div>
                    }
                    <div className="clear"/>
                </div>
                <div className="message-card-footer">
                    {this.message.username}
                    <Twemoji text={this.flag} />
                </div>
                {this.hasTlMsg &&
                <TranslateBotan className="message-card-translate" onMouseDown={this.toggleCurrentLanguage} />
                }
            </div>
        )
    }

    renderAnimation() {
        // TODO: Can I get rid of this?
        let animationUrl: ExternalLink;
        let artistUrl: ExternalLink;
        if (this.message.animationLink == undefined) {
            animationUrl = stringToLink("about:blank");
        } else {
            animationUrl = this.message.animationLink;
        }
        if (this.message.artistLink == undefined) {
            artistUrl = stringToLink("about:blank");
        } else {
            artistUrl = this.message.artistLink;
        }
        return (
            <div>
                <div className="message-card-text-container justify-align-center">
                    <img src={linkToString(animationUrl)} alt={this.message.title} />
                </div>
                <div className="artwork-card-footer">
                    <div className="title">{this.message.title}</div>
                    <div className="artist"><a href={linkToString(artistUrl)}>{this.message.username}</a></div>
                </div>
            </div>
        )
    }

    render() {
        // TODO: Fix this bad logic, retriving message.constructor.name gives Object
        if (this.message.messageID == 9999) {
            return this.renderCard(this.renderAnimation());
        }
        return this.renderCard(this.renderMessage());
    }
}
