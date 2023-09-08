
// Clear contents of User Interface Message element
function clear_UI_messages(){
  let element = '#UI-messages'
  const UI_element = document.querySelector(element);
  UI_element.innerHTML = ''
              
  //while(debug_element.firstChild) {
   //   debug_element.removeChild(debug_element.firstChild);
  //}
}


//
//  clearout email list before reloading it
//
function empty_contents_of_emails_list(mailbox){
  var mailbox_element = document.querySelector('.emails-list-wrapper');
  mailbox_element.innerHTML = ''
}

//
// return the name part of an email address
//
function get_sender_name(sender){
  parse_sender = sender.split('@')
  return(parse_sender[0])
}

//
// Deactivate the old tab and activate the clicked one
//
function activate_tab(tab){
  // Toggle Current Active Tab Off
  let active_tab = document.querySelector('.active-tab')
  active_tab.classList.toggle('active-tab')
  // Set New Active Tab
  let new_active_tab = document.querySelector(`#${tab}`)
  new_active_tab.classList.toggle('active-tab')

  return
}

//
//  invoke a fetch on the emails:POST to send a message
//
function compose_email(to='', subject='', body='') {

  // Clear UI Box
  clear_UI_messages()

  // Toggle Active Tab
  activate_tab('compose')

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Prefill Compose form fields
  document.querySelector('#compose-recipients').value = to;
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = body;

  // initialise send button animation
  send_btn = document.querySelector('#compose-submit')
  send_btn.style.animationPlayState = "paused"
  send_btn.style.opacity = 1

  // Handle Form Submission
  document.querySelector('#compose-form').onsubmit = function() {

    msg_recipients = document.querySelector('#compose-recipients').value
    msg_subject = document.querySelector('#compose-subject').value
    msg_body = document.querySelector('#compose-body').value

    var return_status
    fetch("/emails",  // The Django url path
          {           // The fetch init attributes. A request method and a body
          method:"POST",
          body: JSON.stringify({"subject": msg_subject,
                                "recipients": msg_recipients,
                                "body": msg_body
                              })
          }
    )
    .then(response => {
      return_status = response.status
      clear_UI_messages()
      return response.json()
    })
    .then(result => {
      if (return_status == 201){ // Message Sent Successfully
        display_UI_message(result.message)
        // Trigger send button animation
        send_btn.style.animationPlayState = "running"
        setTimeout(function(){load_mailbox('sent')},1000)
      }else{
        display_UI_message('Message Failed with status: '+return_status)
        display_UI_message(result.error)
      }

    })
    .catch((error) => {
      error = 'Error Sending Message => '+error
      display_UI_message(error)
    });

   

    return false
  }

}


function get_mailbox_name(){
  // get current mailbox
  let mailbox_title_element = document.querySelector('.email-list-name')
  let mailbox_title = mailbox_title_element.innerHTML
  let mailbox = mailbox_title.toLowerCase().replace(/\s/g,'')

  return(mailbox)
}






function display_mailbox_view(mailbox){
  mailbox_element = document.querySelector('#emails-view')
  compose_element = document.querySelector('#compose-view')

  mailbox_element.style.display = 'block';
  compose_element.style.display = 'none';

  let mailbox_title_element = document.querySelector('.email-list-name')

  let mailbox_title = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}`;
  mailbox_title_element.innerHTML = mailbox_title;

  return
}


function load_mailbox(mailbox) {

  // Clear UI Message Box
  clear_UI_messages()

  // Clear email Message and Display the Mail viewing area JMC Logo
  clear_email_message_viewer('reset-default') 

  // Highlight Active Tab
  activate_tab(mailbox)

  // Show the mailbox and hide other views
  display_mailbox_view(mailbox)

  // get mailbox email list
  refresh_email_list()
  
  return

}

// Fetch the latest emails from the Mail API for the specified mailbox
function refresh_email_list(){

  // get mailbox name
  mailbox = get_mailbox_name()

  // empty contents of emails list
  empty_contents_of_emails_list(mailbox)

  let path = '/emails/'+mailbox
  fetch(path)
  .then(response => response.json()) // JSON String Formated Object (Like The envelope)
  .then(emails => {  // Parsed into usable Javascript Object (like the contents of the envelope)
      let num_emails = emails.length
      if(num_emails === 0){
        empty_mailbox_message = {"sender":"", "subject":"You have no messages", "timestamp":""}
        add_email_message_to_mailbox(empty_mailbox_message)
      }
      
      for (let i = 0; i < num_emails; i++){
        add_email_message_to_mailbox(emails[i])
      }
    })
    .catch((error) => {
      error = 'refresh_email_list(): Error Fetching Messages => '+error
      display_UI_message(error)
    });

  return

}





//
//  Called by refresh_emails_list()
//  adds the email name, subject and timestamp to the emails list
//  creates an eventListener so that it can be clicked to read message
//
function add_email_message_to_mailbox(email){

  // set CSS Style for the email list item
  let email_class = ''
  if(email.sender === ''){  // If mailbox contains no messages
      email_class = 'email-list-item-inactive'
  }else{
    if(email.read === true){
      email_class = 'email-list-item-read'
    }else{
      email_class = 'email-list-item-unread'
    }
  }

  // Select the element containing the emails list
  emails_list = document.querySelector('.emails-list-wrapper')

  // get name part of email
  let sender_name = null 
  sender_name = email.sender.split('@')[0]

  //  Create a DOM Node structure for the email
  new_row = `
    <div class='email-flexbox ${email_class}' data-email_id=${email.id}>
        <div class = 'email-sender'>
            ${sender_name}
        </div>
        <div class='email-subject'>
            ${email.subject}
        </div>
        <div class = 'email-timestamp'>
            ${email.timestamp}
        </div>
    </div>
  `

  //create a new div containing the email data
  const new_email_row = document.createElement("div")
  new_email_row.innerHTML = new_row
  emails_list.appendChild(new_email_row)

  // Add eventListener to email link so that they can be handled later
  if(email.sender != ''){
    emails_list.lastChild.addEventListener('click', read_message)
  }
  return

}






//  read_mesages()
// 
//  Called when a message is clicked in the email list
//  fetches a specific email from the emails/<int: email_id> path of the API
//
function read_message(event){
  
  // clear UI messages
  clear_UI_messages()

  // set the selected email to have active status
  // Set style of selected email to be active email style
  // toggle the old active-email off and  
  //
  // Notes:
  // Bug: There was a bug where 'event.target' seemed to return the expected element clicked when selecting the center
  // of the elemnt but returned the parentElement when you clicked on the border of the element
  // 
  // Solution:
  // using 'this' instead of event.target seems to return the container element of the clicked div with the border
  // consistently. So then I could query the element for the child element containing the dataset-email_id.
  //
  // probably This could also be solved by placing the dataset in the parent element (class='active-email) too
  // hmmm weird

  // get email_id of clicked email message
  selected_email = this
  selected_email_flexbox = selected_email.querySelector('.email-flexbox')
  email_id = parseInt(selected_email_flexbox.dataset.email_id)

  // set clicked email to active-email
  active_email = document.querySelector('.active-email')
  if(active_email != null){
    active_email.classList.toggle('active-email')
  }
  selected_email_flexbox.classList.add('active-email')

  fetch(`emails/${email_id}`)
  .then(response => response.json())
  .then(email => {

      if(email.read === false){
          fetch(`/emails/${email_id}`, {
              method: 'PUT',
              body: JSON.stringify({read: true})
          })
          .catch(error => {
              display_UI_message('read_message() stringify(read: true) : method: PUT catch(error)'+error)
          });
      }
      display_email_message(email)
  })
  .catch(error => {
    display_UI_message('read_message():GET.catch(error)'+error)
  })

return

}






// Displays the contents of the selected message
//
//  display_email_message
//  called by read_message
//  takes a message as input and creates a div element for it in the DOM
//  message is inserted in the element with class 'email-message-body'
//
function display_email_message(email){

  // If message viewer is closed, open it up
  read_email_wrapper = document.querySelector('.read-email-wrapper')
  if (read_email_wrapper.style.display === 'none'){
      open_msg() // re-opens the div and resets the UI to defaults
  }

  // prepare message space for new message or display the splash screen
  clear_email_message_viewer('new-message') // remove message and leave empty space

  let message_body_html = `
  <div>
    <div id='email-sender' class = 'msg-header'><b>From:</b> ${email.sender}</div>
    <div id='email-recipients' class = 'msg-header'><b>To:</b> ${email.recipients}</div>
    <div id='email-subject' class = 'msg-header'><b>Subject:</b> ${email.subject}</div>
    <div id='email-timestamp' class = 'msg-header'><b>Date:</b> ${email.timestamp}</div>
    <hr>
    <br>
    <div id='email-body' >${email.body}</div>
  </div>
  ` 

  // Insert new html inside the email-message-body Element
  email_message_element = document.querySelector('.email-message-body')
  email_message_element.innerHTML = message_body_html


  // Set messageLoaded and email_id inside read_email_wrapper
  // message-loaded is used in the clear-view-message function
  // dataset email_id is used by the reply function
  read_email_wrapper = document.querySelector('.read-email-wrapper')
  read_email_wrapper.dataset.messageLoaded='true'
  read_email_wrapper.dataset.email_id=email.id

  return

}


//
// clear_email_message_viewer_element(action)
// This function prepares the element used for displaying the contents of the email. 
// The element will be presented differently and have different options available to the user 
// depending on the permutations of the parameters ‘mailbox’ and ‘action’
//
function clear_email_message_viewer(action){
    console.log('### clear_email_message_viewer ###')
    let mailbox_name = get_mailbox_name()
    console.log('mailbox_name => ', mailbox_name)
    // old_message; 	This is the element used to contain the email message contents. 
		// Its class name in the DOM is ‘email-message-body’
    let old_message = document.querySelector('.email-message-body')

    let jmc_splash = document.querySelector('.jmc-splash-wrapper')
    let reply_btn = document.querySelector('.reply-btn')
    let archive_btn = document.querySelector('.archive-btn')
    let unarchive_btn = document.querySelector('.unarchive-btn')

    // set message viewer status depending on action eg  enable/disable read and archive butons - 
    old_message.innerHTML=''
    if(action === 'reset-default' || action === 'close-message'){
        // hide all the buttons and diaplay the JMC Logo
        console.log('reset-default')
        reply_btn.style.display='none'
        archive_btn.style.display='none'
        unarchive_btn.style.display='none'
        active_email = document.querySelector('.active-email')
        if(active_email != null){
          active_email.classList.remove('active-email')
        }
        jmc_splash.style.display='flex'
    }else{
        // Display appropriate buttons on each page
        if(mailbox_name === 'inbox'){
          console.log('inbox-buttons')
          reply_btn.style.display = 'block'
          archive_btn.style.display = 'block'
          unarchive_btn.style.display = 'none'
        }else if (mailbox_name === 'archive'){
          console.log('archive-buttons')
          reply_btn.style.display = 'block'
          archive_btn.style.display = 'none'
          unarchive_btn.style.display = 'block'
        }else{ // sent mailbox
          console.log('sent-buttons')
          reply_btn.style.display = 'none'
          archive_btn.style.display = 'none'
          unarchive_btn.style.display = 'none'
        }
        jmc_splash.style.display='none'
    }

    return
    
  
}
















//  show_jmc_splash()
//  sets the jmc-splash-image element to display: block
//
function show_jmc_splash(){
  jmc_splash = document.querySelector('.jmc-splash-image')
  jmc_splash.style.display='block'
}







//
//  element for displaying error messages, status messages and debug info
//
function display_UI_message(message){

  debug_element = document.querySelector('#UI-messages')

  // Insert Div inside the Element
  const node = document.createElement("div");
  const textnode = document.createTextNode(message);
  node.appendChild(textnode);
  debug_element.appendChild(node);


      // Insert Div after the Element
    //debug_element.insertAdjacentHTML("afterend","<h3>This is the text which has been inserted by JS</h3>");


    // Innsert text into Div
    //debug_element.innerHTML = debug_msg

  return

}



//
//  resize_msg(size)
//  size can be zero, maximize, minimize, default or user_defined
//  Resize elements of the interface when a user clicks close, maximise,  minimise or opens a message
//  mail_reader is the box where the user can read the contents of a message
//  email_list is the box displaying the list of all the emails
//  the internal size is the available space in the box without all the padding and title
function resize_msg(new_size){
  let close_box = []
  let maximize = {  "email_list":"6rem", 
                    "email_list_internal":"3.8rem",
                    "mail_reader":"36rem",
                    "mail_reader_internal":"33.5rem",
                 }

  let default_size = {  "email_list":"24rem", 
                        "email_list_internal":"21.8rem",
                        "mail_reader":"18rem",
                        "mail_reader_internal":"15.5rem",
                    }   
  let close_size = {  "email_list":"43rem", 
                      "email_list_internal":"40.8rem",
                      "mail_reader":"3rem",
                      "mail_reader_internal":"0.5rem",
                  } 

  let size = {}
  let user_defined = {}
  switch (new_size){
    case 'zero':
      size = close_size;
      break;
    case 'maximize':
      size = maximize;
      break;
    case 'minimize':
      size = default_size;
      break
    case 'open':
      size = default_size;
      break;
    default:
      size = user_defined; // TODO
      break;
  }

  // default sizes
  // mailbox-wrapper 24rem
  // mails-list-wrapper 21.6 rem
  // resize the email-list
  let mailbox_wrapper = document.querySelector('.mailbox-wrapper')
  let email_list_wrapper = document.querySelector('.emails-list-wrapper')
  mailbox_wrapper.style.height = size.email_list
  email_list_wrapper.style.height = size.email_list_internal


  // default sizes
  // read-email-wrapper 18rem
  // jmc-splash-wrapper 18rem
  // email-msg-block 18rem
  // email-message-body 16rem

  // resise and minimize the displayed message area
  let read_email_wrapper = document.querySelector('.read-email-wrapper')
  //let jmc_splash = document.querySelector('.jmc-splash-wrapper')
  let email_msg_block = document.querySelector('.email-msg-block')
  let email_message_body = document.querySelector('.email-message-body')

  read_email_wrapper.style.height = size.mail_reader
  //jmc_splash.style.height = size.mail_reader
  email_msg_block.style.height = size.mail_reader
  email_message_body.style.height = size.mail_reader_internal

}





//
//  close_msg()
//  close the message element
//
function close_msg(){

  function display_none(){
    read_email_wrapper.style.display='none'
    return
  }

  let read_email_wrapper = document.querySelector('.read-email-wrapper')
  let jmc_splash = document.querySelector('.jmc-splash-wrapper')
  let email_msg_block = document.querySelector('.email-msg-block')
  let email_message_body = document.querySelector('.email-message-body')

  resize_msg('zero')

  read_email_wrapper.style.opacity = 0.1
  jmc_splash.style.display = 'none'
  email_msg_block.style.opacity = 0.1
  email_message_body.style.opacity = 0.1

  //wait for interval 350ms before hiding the element
  setTimeout(display_none, 350)

  return
}





















//
//  open_msg()
//  display the message element
//
function open_msg(){
  let message_element =  document.querySelector('.read-email-wrapper')
  message_element.style.display='block'

  let default_size = {  "email_list":"24rem", 
                        "email_list_internal":"21.8rem",
                        "mail_reader":"18rem",
                        "mail_reader_internal":"15.5rem",
                    }   

  size = default_size
 // default sizes
  // mailbox-wrapper 24rem
  // mails-list-wrapper 21.6 rem
  // resize the email-list
  let mailbox_wrapper = document.querySelector('.mailbox-wrapper')
  let email_list_wrapper = document.querySelector('.emails-list-wrapper')
  mailbox_wrapper.style.height = size.email_list
  email_list_wrapper.style.height = size.email_list_internal


  // default sizes
  // read-email-wrapper 18rem
  // jmc-splash-wrapper 18rem
  // email-msg-block 18rem
  // email-message-body 16rem

  // resise and minimize the displayed message area
  let read_email_wrapper = document.querySelector('.read-email-wrapper')
  //let jmc_splash = document.querySelector('.jmc-splash-wrapper')
  let email_msg_block = document.querySelector('.email-msg-block')
  let email_message_body = document.querySelector('.email-message-body')

  read_email_wrapper.style.height = size.mail_reader
  //jmc_splash.style.height = size.mail_reader
  email_msg_block.style.height = size.mail_reader
  email_message_body.style.height = size.mail_reader_internal


  read_email_wrapper.style.opacity = 1
  email_msg_block.style.opacity = 1
  email_message_body.style.opacity = 1


  resize_msg('open')
}

function strip_message_bold_tags(message_element){
  console.log(('### strop_message_bold_tags ###'))

  const regex = /<b>[\w:</b]*>/g;

  let sender = message_element.querySelector('#email-sender').innerHTML
  sender = sender.replace(regex, '') // replace bold tag html wilth null
  sender = sender.replace(/^\s*.$\s*/g,'') // remove whitespace at start and end
  let to = sender
  console.log('to => ', to)

  let subject = message_element.querySelector('#email-subject').innerHTML
  subject = subject.replace(regex,'').replace(/^\s*.$\s*/g,'')
  console.log('subject -> ', subject)

  let body = message_element.querySelector('#email-body').innerHTML
  body = body.replace(regex,'').replace(/^\s*.$\s*/g,'')
  console.log('body => ', body)

  let timestamp = message_element.querySelector('#email-timestamp').innerHTML
  timestamp = timestamp.replace(regex,'').replace(/^\s*.$\s*/g,'')
  console.log('timestamp => ', timestamp)

  let cleaned_data = {"sender": sender,
                      "subject":subject,
                      "body": body,
                      "timestamp": timestamp
                    } 
  return (cleaned_data)

}

function reply_2_msg(event){
  // Since all the data we need is already in the DOM, its faster to retrieve it from there than from the API
  // select element with class='read-email-wrapper' which contains a dataset with the email_id of the message thats loaded
  //
  // select element with class='email-message-body' which contains the elements with the email contents
  // select elements containing the message data and retrieve their contents
  let message = document.querySelector('.read-email-wrapper') // If you wanted to fetch data from the API 
  let email_id = parseInt(message.dataset.email_id)

  let loaded_html_message = document.querySelector('.email-message-body')
  let clean_data = strip_message_bold_tags(loaded_html_message)

  let sender = clean_data.sender
  let to = sender
  let subject = clean_data.subject
  let body = clean_data.body
  let timestamp = clean_data.timestamp

  if(subject.startsWith('RE: ') === false){
    subject = 'RE: ' + subject
  }
  body = 'On '+ timestamp + ', ' + sender + ' ' + 'wrote: ' + '\n\n' + body

    
  compose_email(to, subject, body)


}




// fetch_put_archive_status(email_id, status)
// email_id is the id of the email
// status is the archived status either true or false
//
function fetch_put_archive_status(email_archived_status){
  // find element with class='read-email-wrapper' which contains a dataset with the email_id thats loaded
  // the email_id is then used to fetch the email details from the API
  // set the archive status of email to the value of email_archived_status
  message = document.querySelector('.read-email-wrapper')
  email_id = parseInt(message.dataset.email_id)
  fetch(`emails/${email_id}`,{
        method: 'PUT',
        body: JSON.stringify({archived:email_archived_status})
  })
  .catch(error => {
    display_UI_message('Error Setting Archive Status. fetch_put_archive_status():PUT.catch(error)'+error)
  })
}

function archive_msg(){
  fetch_put_archive_status(true)
  display_UI_message("Message Archived")
  setTimeout(refresh_email_list, 500)
  clear_email_message_viewer('reset-default')
}

function unarchive_msg(){

  fetch_put_archive_status(false)
  display_UI_message("Message Unarchived")
  setTimeout(refresh_email_list, 500)
  clear_email_message_viewer('reset-default')
}

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archive').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());


  //document.querySelector('#view-email').addEventListener('click', () => read_message());

  // The following is weird
  //
  //  calling the function with just ('click', reply_2_msg)
  //  will supply the hidden parameter 'event' that you can use to get the element that was clicked
  //
  //  calling the function with the long form ('click', () => reply_2_msg())
  //  will not pass the event parameter
  //
  //  calling the function in the format ('click', reply_2_msg())
  //  will not run the function when its clicked
  //
  //  weird
  document.querySelector('.reply-btn').addEventListener('click', reply_2_msg);
  document.querySelector('.archive-btn').addEventListener('click', archive_msg);
  document.querySelector('.unarchive-btn').addEventListener('click', unarchive_msg);
  document.querySelector('.refresh-icon').addEventListener('click', () => refresh_email_list())

  //  Wire up buttons for controlling the message display
  document.querySelector('.minimize-icon').addEventListener('click', () => resize_msg('minimize'));
  document.querySelector('.maximize-icon').addEventListener('click', () => resize_msg('maximize'));
  document.querySelector('.close-icon').addEventListener('click', () => close_msg())


  // By default, load the inbox
  load_mailbox('inbox');
  //setInterval(refresh_email_list, 5000)

});























