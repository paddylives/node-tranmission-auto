const access = {
  ptPathName:"./autodownload",
  finishPathName:"./finish.txt",
  downloadDir:'/home/transmission',
  rpcUrl:"http://localhost:9091/transmission/rpc",
  headersData:{
    'X-Transmission-Session-Id': 'yVrizUf0SRIJ5mY2K1q4yQXLF2jW3QkTJvBiFN0yL0hD8eOl', 
    'X-Requested-With': 'XMLHttpRequest', 
    'Authorization': 'Basic djN1c2VyOnYzdXNlcnA=', 
    'Content-Type': 'application/json',
    'Cookie': 'compact_display_state=true'
  },
}

module.exports = {
  access
}