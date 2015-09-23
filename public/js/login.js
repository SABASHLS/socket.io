var app = angular.module('myApp', []);
app.controller('log-Ctrl', function($scope,$http,$timeout) {
    
    $scope.login=function(){
    var log={
        email:$scope.email,
    password:$scope.password
    }
     $http.post('/login',log).success(function(data) 
          {
         console.log(data);
           if(data == 'true') 
            {
                
                location.href ='/home';
            }
            else
            {            
               alert('invalid username/password');
            }
         
     })
}
   //  $timeout(callAtTimeout, 30000);
});
       
    //function callAtTimeout() {
  //  console.log("Timeout occurred");
//}  