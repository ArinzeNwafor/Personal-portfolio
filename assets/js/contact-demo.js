// contact-demo.js: Show a success message when contact form is submitted

document.addEventListener('DOMContentLoaded', function() {
  var form = document.querySelector('.php-email-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      // Remove any existing message
      var oldMsg = document.getElementById('contact-success-message');
      if (oldMsg) oldMsg.remove();
      // Create new message
      var msg = document.createElement('div');
      msg.id = 'contact-success-message';
      msg.className = 'alert alert-success mt-3';
      msg.textContent = 'Your message has been received! Thank you for reaching out.';
      form.parentNode.insertBefore(msg, form.nextSibling);
      form.reset();
      // Remove the success message after 4 seconds
      setTimeout(function() {
        if (msg.parentNode) msg.remove();
      }, 4000);
    });
  }
});
