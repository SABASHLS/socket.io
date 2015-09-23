var app = angular.module('ctrlApp', []);
app.controller('sign-Ctrl', function($scope,$http) {
    $scope.signup=function(){
    var sign={    
    firstname:$scope.firstname,
   lastname:$scope.lastname,
   email:$scope.email,
   password:$scope.password
    }
    console.log(sign)
    $http.post('/signup',sign).success(function(data) 
          {
         console.log(data);
           if(data == "true") 
            {
                location.href ='/home';
            }
            else
            {            
               alert('invalid username/password');
            }
         
     })
    }
});
       
      