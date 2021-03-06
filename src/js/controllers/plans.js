angular
  .module('itineraryApp')
  .controller('PlansIndexCtrl', PlansIndexCtrl)
  .controller('PlansNewCtrl', PlansNewCtrl)
  .controller('PlansShowCtrl', PlansShowCtrl)
  .controller('PlansEditCtrl', PlansEditCtrl)
  .controller('PlansInviteCtrl', PlansInviteCtrl);

PlansIndexCtrl.$inject = ['Plan'];
function PlansIndexCtrl(Plan) {
  const vm        = this;
  vm.all          = [];
  vm.delete       = plansDelete;

  vm.all = Plan.query();

  function plansDelete(plan) {
    // $http
    //   .delete(`/api/plans/${plan._id}`)
    //   .then(() => {
    //     const index = vm.all.indexOf(plan);
    //     vm.all.splice(index, 1);
    //   });
  }
}

PlansNewCtrl.$inject = ['Plan', '$state'];
function PlansNewCtrl(Plan , $state) {
  const vm = this;
  vm.plan  = {};
  vm.create = plansCreate;

  function plansCreate() {
    Plan
      .save(vm.plan)
      .$promise
      .then(plan => {
        $state.go('plansEdit', { id: plan.id });
      });
  }
}

PlansShowCtrl.$inject = ['Plan', '$state', 'weather'];
function PlansShowCtrl(Plan, $state, weather) {
  console.log($state.params.id);
  const vm = this;
  Plan.get($state.params)
    .$promise
    .then((plan) => {
      vm.plan = plan;
      // if a plan has no items, don't get the weather
      if(!plan.items) return false;

      const lat = vm.plan.items[0].place.location.lat;
      const lng = vm.plan.items[0].place.location.lng;
      const time = vm.plan.items[0].time;

      weather.getForecast(lat, lng, time)
        .then(data => vm.weather = data);
    });

}

PlansEditCtrl.$inject = ['Plan', 'Item', '$state', '$scope'];
function PlansEditCtrl(Plan, Item, $state, $scope) {
  const vm = this;
  vm.plan = {};
  Plan.get($state.params)
    .$promise
    .then(plan => vm.plan = plan);

  $scope.$watch(() => vm.plan, () => {
    console.log(vm.plan);
  }, true);

  vm.places= {
    Bar: 'bar',
    Bowling: 'bowling_alley',
    Gallery: 'art_gallery',
    Cafe: 'cafe',
    Casino: 'casino',
    Club: 'night_club',
    Restaurant: 'restaurant',
    Sports: 'stadium',
    Museum: 'museum',
    Park: 'park'
  };

  vm.plansUpdate = plansUpdate;

  // to be used if you want to update the name of the plan
  function plansUpdate() {
    Plan
      .update(vm.plan)
      .$promise
      .then((response) => {
        // go back to the show page
        console.log(response);
      });
  }

  // function that gets called when you click on an add button next to a google place
  function addItem(place) {
    // create an item object based on the place info from google
    const placeToAdd = {
      googlePlaceId: place.place_id,
      name: place.name,
      location: place.geometry.location.toJSON(),
      address: place.vicinity
    };

    // save the new item, and pass in the plan id that it belongs to as part of the URL
    // item is the req.body (the data)
    Item
      .save({ planId: vm.plan.id }, placeToAdd)
      .$promise
      .then((plan) => {
        // push the newly created item
        vm.plan.items = plan.items;
      });
  }

  vm.addItem = addItem;

  function deleteItem(item) {
    Item
      .delete({ planId: vm.plan.id, id: item.id })
      .$promise
      .then(() => {
        const index = vm.plan.items.indexOf(item);
        vm.plan.items.splice(index, 1);
      });
  }

  vm.deleteItem = deleteItem;

  // when you click save next to the time, update a single item
  function updateTime(item) {
    Item
      // pass in the plan id and item id as part of the url, and pass in the time as the entire req.body
      .update({ planId: vm.plan.id, id: item.id }, { time: item.time })
      .$promise
      .then((response) => {
        // call the reordering function to orderby time (orderByFilter)
        console.log(response);
      });
  }

  vm.updateTime = updateTime;
}

PlansInviteCtrl.$inject = ['Plan', 'Guest', '$state'];
function PlansInviteCtrl(Plan, Guest, $state) {
  const vm = this;
  vm.plan = Plan.get($state.params);

  function addGuest() {
    Guest
      .save({ planId: vm.plan.id }, vm.guest)
      .$promise
      .then((plan) => {
        vm.plan = plan;
      });
  }

  vm.addGuest = addGuest;

  function send() {
    Plan
      .sendInvites({ id: vm.plan.id })
      .$promise
      .then(() => {
        vm.plan.guests = vm.plan.guests.map(guest => {
          guest.invited = true;
          return guest;
        });
      });
  }

  vm.send = send;

  function deleteGuest(guest) {
    console.log('clicked');
    Guest
      .delete({ planId: vm.plan.id, id: guest.id })
      .$promise
      .then(() => {
        // locate the guest in the array of guests
        const index = vm.plan.guests.indexOf(guest);
        // splice it from the array, take 1 element starting from that index
        vm.plan.guests.splice(index, 1);
      });
  }
  vm.deleteGuest = deleteGuest;

}
