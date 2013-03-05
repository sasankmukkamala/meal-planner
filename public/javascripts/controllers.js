/*
 * Controllers Module
 * AngularJS controllers for mealPlanner module.
 * @copyright Daniel Berkompas, 2013
 */
define("controllers", ["jquery", "lodash", "bootbox", "angular", "services"], function($, _, bootbox) {
  var angular = window.angular
    , bootbox = window.bootbox;

  // Configure controller dependencies
  angular.module("controllers", ["services"]);

  /*
   * NewGroupMealCtrl
   * Handles creating new group meals.
   */
  angular.module("controllers").controller("NewGroupMealCtrl", function($scope, $http, $location) {
    // Set up data, using localStorage if possible
    var storedMeal    = angular.fromJson(window.localStorage['newGroupMeal']) || {};
    $scope.name       = storedMeal.name;
    $scope.date       = storedMeal.date;
    $scope.location   = storedMeal.location;
    $scope.mealItems  = storedMeal.mealItems || [];
    $scope.emails     = storedMeal.emails || [];
    $scope.redirectPath = null;

    /*
     * Public: Add a meal item to the mealItems array.
     */
    $scope.addMealItem = function() {
      $scope.mealItems.push({
        name:     $scope.newItemName,
        quantity: $scope.newItemQuantity || 0,
        assigned: $scope.newItemAssigned
      });
      _clearNewItemData();
      _focus("newItemQuantity");
    };

    /*
     * Public: Remove a meal from the mealItems array.
     *
     * item - The item Object to remove from the array.
     */
    $scope.removeMealItem = function(item) {
      var newList = _.reject($scope.mealItems, function(i) { return i.name == item.name });
      $scope.mealItems = newList;
      _focus("newItemQuantity");
    };

    /*
     * Public: Add an email to the emails array.
     */
    $scope.addEmail = function() {
      $scope.emails.push($scope.newEmail);
      $scope.newEmail = null;
      _focus("newEmail");
    };

    /*
     * Public: Remove an email from the emails array.
     */
    $scope.removeEmail = function(email) {
      var newEmails = _.reject($scope.emails, function(e) { return e == email });
      $scope.emails = newEmails;
    }

    /*
     * Public: Convert new Group Meal to JSON.
     */
    $scope.toJson = function() {
      return angular.toJson({
        name:       $scope.name,
        date:       $scope.date,
        location:   $scope.location,
        mealItems:  $scope.mealItems,
        emails:     $scope.emails
      });
    };

    /*
     * Public: Save the group meal to the API.
     */
    $scope.save = function() {
      $http.post("/api/meals.json", { meal: $scope.toJson() }).success(function(response) {
        _clearLocalStorage();
        $location.path("/meals/" + response.meal._id);
      });
    };

    /*
     * Public: Clear local storage and go back to path "/".
     */
    $scope.cancel = function() {
      var warningText = "Are you sure you want to cancel and go back to the home page?  You have unsaved changes.";
      bootbox.confirm(warningText, function(cancel) {      
        if(cancel === true) {
          _clearLocalStorage();
          $location.path("/").replace();
          $scope.$apply();
        };
      });
    };

    /*
     * Internal: Watch toJson() and update localStorage.
     */
    $scope.$watch("toJson()", function(result) {
      window.localStorage['newGroupMeal'] = result;
    });

    /*
     * Private: Clear the new meal item data.
     */
    function _clearNewItemData() {
      $scope.newItemName     = null;
      $scope.newItemQuantity = null;
      $scope.newItemAssigned = null;
    };

    /*
     * Private: Clear Local Storage.
     */
    function _clearLocalStorage() {
      window.localStorage['newGroupMeal'] = null;
    };

    /*
     * Private: Focus on an element of the view.
     */
    function _focus(model_name) {
      $("[ng-model=" + model_name +"]").focus();
    };
  });

  /*
   * ShowMealCtrl
   * Displays meals based on an ID.
   */
  angular.module("controllers").controller("ShowMealCtrl", function($scope, $routeParams, Meal) {
    _loadMeal();

    /*
     * Private: Load the meal. Automatically polls again after
     * 3 seconds to make sure the page stays updated.
     */
    function _loadMeal() {
      if($routeParams.id != null) {      
        $scope.meal = Meal.get({id: $routeParams.id});
        window.setTimeout(_loadMeal, 3000);
      }
    };

  });

  /*
   * NewScheduledMealCtrl
   * Handles creating new scheduled meals.
   */
  angular.module("controllers").controller("NewScheduledMealCtrl", function($scope) {

  });

});