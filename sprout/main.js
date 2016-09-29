$('#form').on('submit', function(ev) {
  ev.preventDefault();
  let recPlan = (getRecommendedPlan());
  console.log(recPlan);
  console.log(planDataObj[recPlan]['headline']);
  //update plan info
  $("#planRecName").text(recPlan)
  $("#headline").text(planDataObj[recPlan]['headline'])

  // update table with correct data
  $("#costMonth").text(planDataObj[recPlan]['details']['Cost Per Month'])
  $("#nbProfiles").text(planDataObj[recPlan]['details']['Number of Social Profiles'])
  $("#keywords").text(planDataObj[recPlan]['details']['Brand Keywords per Group'])
  $("#includedUs").text(planDataObj[recPlan]['details']['Included Users'])
  $("#addUs").text(planDataObj[recPlan]['details']['Additional Users'])
  $("#includedGr").text(planDataObj[recPlan]['details']['Included Groups'])
  $("#audience").text(planDataObj[recPlan]['details']['Audience Size (Fans/Followers)'])

  // remove existing demo content
  $(".demoContent").css("display","none");
  $(".demo").css("display","block");
  $(".cta").css({"background-color": "#F5FCF6", "background-image": "none"});
  // add plan content
  $(".planContent").fadeIn( "slow" );

  // insert correct button link
  $("#tryButton").attr("href", signUp[recPlan]);
  console.log(signUp[recPlan]);


});

// signup links
var signUp ={
  'Deluxe':'https://app.sproutsocial.com/signup/start/deluxe_v5',
  'Premium':'https://app.sproutsocial.com/signup/start/premium_v5',
  'Team':'https://app.sproutsocial.com/signup/start/team_v5',
  'Enterprise':'http://sproutsocial.com/demo?plan=enterprise'
}

/**
 * All of the data about our plans.
 */
var planDataObj = {
  'Deluxe': {
    headline: 'For the social small business',
    details: {
      'Cost Per Month': '$59',
      'Number of Social Profiles': 5,
      'Brand Keywords per Group': 5,
      'Included Users': 1,
      'Additional Users': 59,
      'Included Groups': 1,
      'Audience Size (Fans/Followers)': 'Up to 100,000'
    },
    values: {
      socialprofiles: 5,
      users: 1,
      audience: 100000,
      costPerMonth: 59,
      costPerUser: 59
    }
  },
  'Premium': {
    headline: 'A bigger plan for bigger social needs',
    details: {
      'Cost Per Month': '$99',
      'Number of Social Profiles': 10,
      'Brand Keywords per Group': 10,
      'Included Users': 1,
      'Additional Users': '$99',
      'Included Groups': 3,
      'Audience Size (Fans/Followers)': 'Up to 200,000'
    },
    values: {
      socialprofiles: 10,
      users: 1,
      audience: 200000,
      costPerMonth: 99,
      costPerUser: 99
    }
  },
  'Team': {
    headline: 'Collaborate and conquer social media',
    details: {
      'Cost Per Month': '$500',
      'Number of Social Profiles': 30,
      'Brand Keywords per Group': 10,
      'Included Users': 3,
      'Additional Users': '$125',
      'Included Groups': 20,
      'Audience Size (Fans/Followers)': 'Up to 500,000'
    },
    values: {
      socialprofiles: 30,
      users: 3,
      audience: 500000,
      costPerMonth: 500,
      costPerUser: 125
    }
  },
  'Enterprise': {
    headline: 'Maximize your global social reach',
    details: {
      'Cost Per Month': '$1,500',
      'Number of Social Profiles': 50,
      'Brand Keywords per Group': 20,
      'Included Users': 10,
      'Additional Users': '$125',
      'Included Groups': 50,
      'Audience Size (Fans/Followers)': 'Unlimited'
    },
    values: {
      // intentionally big numbers for easier comparison logic
      socialprofiles: Number.MAX_SAFE_INTEGER,
      users: 10,
      audience: Number.MAX_SAFE_INTEGER,
      costPerMonth: 1500,
      costPerUser: 125
    }
  }
};

/**
 * Recommend a plan based on the form input.
 */
function getRecommendedPlan() {
  const formValuesArray = $('#form').serializeArray();
  const formValues = _.zipObject(_.map(formValuesArray, 'name'), _.map(formValuesArray, i => parseInt(i.value, 10) || 1));

  // Make 100% sure the plans are sorted in ascending order
  let planNames = _.sortBy(_.keys(planDataObj), (plan) => planDataObj[plan].values.socialprofiles);
  let recommendedPlan = planNames[0];

  ['audience', 'socialprofiles'].forEach((key) => {
    recommendedPlan = planNames.filter((plan) => (formValues[key] || 0) <= planDataObj[plan].values[key]).shift();
    planNames = planNames.slice(planNames.indexOf(recommendedPlan));
  });

  // Recommend plan based on multiple users
  if (formValues.users > 1 && planDataObj[recommendedPlan].values.users === 1) {
    const recommendedPlanValues = planDataObj[recommendedPlan].values;
    const recommendedPlanCost = recommendedPlanValues.costPerUser * formValues.users;
    const biggerPlan = planNames.filter((plan) => {
      const {
        users,
        costPerUser,
        costPerMonth
      } = planDataObj[plan].values;
      const extraUsers = Math.max(formValues.users - users, 0);
      const biggerPlanCost = costPerMonth + extraUsers * costPerUser;
      return biggerPlanCost <= recommendedPlanCost;
    });

    recommendedPlan = _.isEmpty(biggerPlan) ? recommendedPlan : biggerPlan.shift();
  }

  return recommendedPlan;
}