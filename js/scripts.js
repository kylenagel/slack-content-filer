//APPEND THE MASK TO THE PAGE
var textbox = document.createElement('div');
textbox.id = "kn_mask";
document.body.appendChild(textbox);

//ADD MOMENT SCRIPT FOR LATER USE
var moment_script = document.createElement("script");
moment_script.type = "text/javascript";
moment_script.src = '//host.coxmediagroup.com/cop/digital/common/js/moment.js';
document.getElementsByTagName("head")[0].appendChild(moment_script);

//FUNCTIONS OBJECT
var f = {};

//DATA ABOUT MESSAGE AND MESSENGER
var message_data = {
    active_user: window.cmgo_methode_admin_bar_profile[0],
    content_sent_digital_channel_id: 'C0N8FGP70',
    email_recipient: 'CMG-COH-Breaking_News_Team@coxinc.com'
};

//DATA ABOUT THE PAGE WE'RE ON
//THIS IS MOSTLY PROVIDED LATER BY PHP AND OTHER FUNCTIONS
var page_data = {
    byline: '',
    publish_time: '',
    uuid: '',
    loid: '',
    methode_url: '',
    live_url: document.URL,
    domain: document.domain,
    title: '',
    anvato_videos: []
}

//FUNCTION THAT TRANSFORMS THE PUBLISH DATE
//FROM A FORM OF '20170819205900' TO HUMAN-READABLE FORM
f.get_publish_date = function(d) {
    //HAVE WE ADDED THE moment LIBRARY TO THE PAGE YET?
    if (typeof moment == 'function') {
        var year = d.substr(0,4);
        var month = d.substr(4,2);
        var day = d.substr(6,2);
        var hour = Number(d.substr(8,2))-4;
        var minute = d.substr(10,2);
        var formatted_date = moment(new Date(month+"-"+day+"-"+year+" "+hour+":"+minute)).format('h:mm a, MMMM D, YYYY');
        page_data.publish_time = formatted_date;
    //IF WE HAVEN'T ADDED moment LIBRARY YET,
    //LET'S PAUSE AND RUN IT AGAIN
    } else {
        setTimeout(function() {
            f.get_publish_date(d);
        }, 200);
    }
}

// FUNCTION TO APPEND STYLESHEETS
f.append_stylesheets = function() {
    //THESE ARE THE CSS STYLESHEETS WE WANT TO ADD
    var stylesheets = [
        'https://host.coxmediagroup.com/cop/digital/sites/common/standalone/methode_admin_bar/bookmarklet_slack_styles.min.css',
        'https://fonts.googleapis.com/css?family=Open+Sans+Condensed:300'
    ];
    //LET'S LOOP THROUGH THE CSS FILE PATHS AND ADD THEM TO THE PAGE
    for (var i=0; i<stylesheets.length; i++) {
        var cmglink = document.createElement("link");
        cmglink.rel = 'stylesheet';
        cmglink.type = 'text/css';
        cmglink.href = stylesheets[i];
        document.getElementsByTagName("head")[0].appendChild(cmglink);
    }
}

//FUNCTION TO SEND THE SLACK MESSAGE
f.send_slack_message = function(message) {
    // CREATE THE OBJECT THAT WILL BE SENT TO SLACK WITH POST MESSAGE REQUEST
    var slack_message_data = {
        token: message_data.active_user.slack_token,
        channel: message_data.content_sent_digital_channel_id,
        text: message,
        as_user: true
    }
    // POST THE MESSAGE
    $.post('https://slack.com/api/chat.postMessage', slack_message_data);
}

//FUNCTION TO SEND EMAIL
f.email_bnt = function(message) {
    //THIS IS THE OBJECT HOLDING THE DATA ABOUT THE EMAIL
    //IT WILL BE SENT TO PHP LATER THIS FUNCTION
    var mail_data = {};
    mail_data.send_to = message_data.email_recipient;
    mail_data.title = page_data.title;
    //NOTE THAT WE'RE REPLACING "\r\n\" BREAKS FROM THE MESSAGE textarea
    //WITH UNIQUE CHARACTER(S) THAT CAN BE FOUND AND REPLACED
    //LATER BY PHP TO MAKE LINE BREAKS WORK IN ALL EMAILS
    mail_data.message = message.replace(/(?:\\[rn]|[\r\n])/g,"{}");
    mail_data.sender = message_data.active_user;
    mail_data = JSON.stringify(mail_data);
    mail_data = encodeURIComponent(mail_data);
    //SEND THE DATA TO THE PHP FILE THAT WILL SEND THE EMAIL
    $.get('https://host.coxmediagroup.com/cop/digital/sites/common/standalone/methode_admin_bar/bookmarklet_slack_send_email.php?data='+mail_data)
    .then(function(response) {
        //CHECKING FOR ANY RESPONSE ...
        console.log(response);
    })
}

//FUNCTION TO SHOW MODAL
//AND OUTPUT THE PAGE CONTENT TO THE MODAL
f.create_text_box = function() {
    //HAVE WE ALREADY ADDED moment.js TO THE DOM
    //AND CONVERTED THE TIME AS HUMAD-READABLE?
    if (page_data.publish_time) {
        //THIS IS WHERE WE FORMAT THE MESSAGE WITH PAGE DATA
        //THE MESSAGE WILL BE INSERTED INTO THE textarea IN THE POP-UP MODAL
        var message = '&bull; Headline: "'+page_data.title+'"';
        if (page_data.byline) {
            message += '\r\n&bull; Byline: '+page_data.byline;
        }
        message += '\r\n&bull; Published: '+page_data.publish_time;
        message += '\r\n&bull; Methode: '+page_data.methode_url;
        message += '\r\n&bull; Live: '+page_data.live_url;
        //IF THERE ARE VIDEOS, ADD THEM TO THE MESSAGE BODY
        //existance of video(s) determined within function f.get_page_data
        if (page_data.anvato_videos.length>0) {
            message += '\n&bull; Video: ';
            for (i=0; i<page_data.anvato_videos.length; i++) {
                if (i>0) {
                    message += ' | https://mcp.anvato.com/cms/editvideo/'+page_data.anvato_videos[i];
                } else {
                    message += 'https://mcp.anvato.com/cms/editvideo/'+page_data.anvato_videos[i];
                }
            }
        }
        // CREATE CONTENT OF THE MODAL AS VARIABLE "text_block"
        var text_block = '<div class="header_row">';
            text_block += '<div class="header_row_section image_container">';
                text_block += '<img src="https://www.kylernagel.com/work/projects/slack-content-filer/img/megaphone.png" alt="" width="100%"/>';
            text_block += '</div>';
            text_block += '<div class="header_row_section title">';
                text_block += '<h2>SPREAD THE WORD</h2>'
            text_block += '</div>';
        text_block += '</div>';
        text_block += '<div class="text_container">';
            text_block += '<textarea>'+message+'</textarea>';;
        text_block += '</div>';
        text_block += '<div class="send_data_container">';
            text_block += '<p class="slack_identity">Will send as: '+message_data.active_user.full_name+'</p>';
            text_block += '<div class="checkboxes_row">';
                text_block += '<div class="checkboxes_container">';
                    text_block += '<div class="checkbox_container">';
                        text_block += '<input type="checkbox" name="send_to_slack" id="send_to_slack"/>';
                        text_block += '<label for="send_to_slack">Send to Slack</label>'
                    text_block += '</div>';
                    text_block += '<div class="checkbox_container">';
                        text_block += '<input type="checkbox" name="email_bnt" id="email_bnt"/>';
                        text_block += '<label for="email_bnt">Email BNT</label>'
                    text_block += '</div>';
                text_block += '</div>';
            text_block += '</div>';
            text_block += '<div class="button_container">';
                text_block += '<button>SEND</button>';
            text_block += '</div>';
        text_block += '</div>';
        //HERE'S WHERE WE CREATED THE MODAL DIV AND APPEND IT
        var textbox = document.createElement('div');
        textbox.id = "content_filer";
        textbox.innerHTML = text_block;
        document.body.appendChild(textbox);
        //IF SOMEONE CLICKS THE MASK, IT CLOSES THE MASK AND MODAL
        var mask = document.getElementById("kn_mask");
        mask.addEventListener("click", function(e) {
            $("#content_filer, #kn_mask").remove();
        });
        //IF SOMEONE CLICKS "SEND," IT WILL SEND WHATEVER MESSAGE
        //WHOSE CHECKBOX HAS BEEN CLICKED BY THE USER
        var file_button = document.getElementById("content_filer")
                            .getElementsByTagName("button")[0];
        file_button.addEventListener("click", function(e) {
            // GET THE MESSAGE CONTENT FROM THE MODAL
            var message = document.getElementById("content_filer")
                            .getElementsByTagName("textarea")[0]
                            .value;
            //CHECK WHICH CHECKBOXES ARE CHECKED
            var send_to_slack = document.getElementById("send_to_slack").checked;
            var email_bnt = document.getElementById("email_bnt").checked;
            //WANT EMAIL SENT? SEND EMAIL
            if (email_bnt) {
                f.email_bnt(message);
            }
            //WANT SLACK MESSAGE SENT? SEND SLACK MESSAGE
            //TO THE #content_sent_digital CHANNEL OF premium TEAM
            if (send_to_slack) {
                f.send_slack_message(message);
            }
            // REMOVE THE MASK AND MODAL AFTER SOMEONE HAS CLICKED "SEND"
            $("#content_filer, #kn_mask").remove();
        });

    } else {
        //IF WE DON'T HAVE A HUMAN-READABLE PUBLISH DATE PRODUCED BY FUNCTION f.get_publish_date,
        //LET'S TRY THIS FUNCTION AGAIN
        setTimeout(function() {
            f.create_text_box();
        }, 200);

    }
}

// FUNCTION TO GET PAGE CONTENT
f.get_page_data = function(url) {
    $.get('https://host.coxmediagroup.com/cop/digital/sites/common/standalone/methode_admin_bar/bookmarklet_slack_get_page_data.php?url='+url)
    .then(function(result) {
        //SAVE THE DATA FROM THE PAGE METADATA RETURNED BY THE PHP FILE
        result = JSON.parse(result);
        page_data.uuid = result.uuid;
        page_data.loid = result.loid;
        page_data.title = result.title.trim();
        page_data.methode_url = 'https://swing.producercmg.cloud/swing/app/#open/'+result.uuid;
        // GET THE BYLINE IF THERE IS ONE
        if (DDO.contentData.contentByline) {
            page_data.byline = DDO.contentData.contentByline;
        }
        //==== HERE'S WHERE WE GET THE ANVATO VIDEOS ON THE PAGE ====
        var d = page_data.domain;
        var anvato_videos = [];
        //IF ON PREMIUM SITES, LOOK FOR THAT VIDEO CONTAINER CLASS NAME
        //on PREMIUM sites, all videos have a container div with class "video-player"
        if (
            d == 'www.mydaytondailynews.com'
            || d == 'www.springfieldnewssun.com'
        ) {
            anvato_videos = document.getElementsByClassName('video-player');
        }
        //IF ON FREE SITES, LOOK TO SEE IF THERE'S A LEAD VIDEO AND THEN VIDEOS IN THE BODY
        //on FREE sites, video container in the lead position has class "lead-video"
        //other videos in the body are in the same container divs as any inline media, with class "story-inline-media"
        //so, we'll check is there's a video at top
        //then we'll get all the elements with class "story-inline-media"
        //then we'll check to see if the first child in those online elements is an iframe that's an anvato video
        else if (
            d == 'www.dayton.com'
            || d == 'www.journal-news.com'
            || d == 'www.daytondailynews.com'
        ) {
            var anvato_videos = [];
            //==THIS IS THE CHECK FOR THE LEAD VIDEO
            var lead_video_exists = document.getElementsByClassName('lead-video');
            //IF THERE IS A LEAD VIDEO CONTAINER,
            //SAVE IT TO THE ARRAY OF ANVATO VIDEO CONTAINERS
            if (lead_video_exists.length>0) {
                anvato_videos.push(lead_video_exists[0]);
            }
            //==THIS IS THE CHECK FOR INLINE VIDEOS
            var inline_elements = document.getElementsByClassName('story-inline-media');
            //IF THERE ARE INLINE ELEMENTS
            if (inline_elements.length>0) {
                //LOOP THROUGH ALL THE INLINE ELEMENTS TO CHECK FOR IFRAMES
                for (i=0; i<inline_elements.length; i++) {
                    //CHECK FOR IFRAME
                    var iframe = inline_elements[i].getElementsByTagName('iframe');
                    //IF THERE IS AN IFRAME INSIDE THIS INLINE CONTENT CONTAINER
                    if (iframe.length>0) {
                        //GET THE INNER HTML OF THE IFRAME, WHICH WE'LL CHECK FOR A VIDEO
                        var innerhtml = iframe[0].contentDocument.body.innerHTML;
                        //IS THERE A MENTION OF ANVATO INSIDE THE IFRAME CONTENT?
                        if (innerhtml.indexOf('anvato')!=-1) {
                            //IF WE'VE DETERMINED THERE'S AN ANVATO VIDEO INSIDE THIS IFRAME
                            //THEN SAVE IT TO THE ARRAY OF ANVATO VIDEO CONTAINERS
                            anvato_videos.push(inline_elements[i]);
                        }
                    }
                }
            }
        }
        //IF THERE ARE VIDEOS ON THE PAGE
        //LOOP THROUGH THE VIDEO CONTAINER DIVS TO GET THE VIDEO DIV AND ITS ANVATO IDS
        if (anvato_videos.length>0) {
            console.log(anvato_videos);
            for (i=0; i<anvato_videos.length;i++) {
                var this_video_container = anvato_videos[i];
                var video_iframe = this_video_container.getElementsByTagName('iframe');
                var video_json = video_iframe[0].contentDocument.head.children[1].innerHTML.split("= ")[3];
                video_json = video_json.replace(/;/g,"");
                video_json = JSON.parse(video_json);
                var video_id = video_json.video;
                page_data.anvato_videos.push(video_id);
            }
        }
        // ==== END ANVATO VIDEO ACQUISITION ====
        //START THE PROCESS OF ADDING THE MASK AND BOX WITH CONTENT ON THE PAGE
        f.create_text_box();
    });
}

// CALL THE FUNCTIONS TO START THE BALL ROLLING
f.append_stylesheets();
f.get_publish_date(DDO.contentData.contentPublishDate);
f.get_page_data(page_data.live_url);