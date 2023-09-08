


function button_click(){
    debug_msg = document.querySelector('#debug-messages')
    debug_msg.innerHTML = '#### button_click ###'
  
    return false;
  }
  
  
  function ping_api(){
  
  
  
    debug_msg = document.querySelector('#debug-messages')
    debug_msg.innerHTML = '#### ping_apt ###'
  }
  
  function clear_debug_messages(element){
    var debug_element = document.querySelector(element);
                
    while(debug_element.firstChild) {
        debug_element.removeChild(debug_element.firstChild);
    }
  
    // or
    //debug_element.innerHTML = ''
  
  }



function play_with_JSON() {
  
    mailbox='inbox'
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
  
    let mailbox_title = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
    let mailbox_element = `<div> ${mailbox_title}`
    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = mailbox_element;
  
  
    debug_element = document.querySelector('#debug-messages')
  
    // create a javascript object
    const message_obj = {"name":"Jef","Guitar":"Telecaster"}
    
    // The JSON vserion is the object converted to a string.
    // Essentially it becomes enclosed in single quotes
    // '{"name":"Jef","Guitar":"Telecaster"}'
    const message_json = JSON.stringify(message_obj)
  
    // A javscript object must be converted to a JSON before is its sent to a Server
    // as an API response
  
    // Insert Div inside the Element
    print_debug_message(message_json)
  
  
    fetch('/emails_fake',{ method: 'GET'})
    .then(response => response.json()) // the response from the fetch caste as a json
    .then(result => { // The json response parsed to a javascript object, a python dict
      print_debug_message(result)
      
      data_json = JSON.stringify(result)
      print_debug_message(data_json)
  
      subject = result['subject']
      print_debug_message('Subject = ' + subject)
      recipient = result['recipient']
      print_debug_message('recipient = ' + recipient)
      body = result['body']
      print_debug_message('body = ' + body)
  
    })
    .catch((error) => {
      error = 'fetch error => '+error
      print_debug_message(error)
    });
  
  }