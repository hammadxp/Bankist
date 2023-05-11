'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2022-10-03T10:17:24.185Z',
    '2022-10-04T14:11:59.604Z',
    '2022-10-05T17:01:17.194Z',
    '2022-10-06T08:36:17.929Z',
    '2022-10-07T10:51:36.790Z',
  ],
  // movementsDates: [
  //   '2019-11-18T21:31:17.178Z',
  //   '2019-12-23T07:42:02.383Z',
  //   '2020-01-28T09:15:04.904Z',
  //   '2020-04-01T10:17:24.185Z',
  //   '2020-05-08T14:11:59.604Z',
  //   '2020-05-27T17:01:17.194Z',
  //   '2020-07-11T23:36:17.929Z',
  //   '2020-07-12T10:51:36.790Z',
  // ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////

// Elements

const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//

// Formate movements dates

const formatMovementDate = function (acc, date) {
  const daysInbetween = function (date1, date2) {
    return Math.round(
      Math.abs((new Date(date2) - new Date(date1)) / (1000 * 60 * 60 * 24))
    );
  };
  const daysAgo = daysInbetween(date, new Date());

  if (daysAgo === 0) return `Today`;
  if (daysAgo === 1) return `Yesterday`;
  if (daysAgo <= 7) return `${daysAgo} days ago`;
  // else {
  //   const day = `${date.getDate()}`.padStart(2, 0);
  //   const month = `${date.getMonth() + 1}`.padStart(2, 0);
  //   const year = date.getFullYear();
  //   return `${day}/${month}/${year}`;
  // }
  else {
    return new Intl.DateTimeFormat(acc.locale).format(date);
  }
};

// Format Currency

const formattedCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

// Add movements rows

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const movementDate = formatMovementDate(currentAccount, date);

    const movementHTML = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${movementDate}</div>
        <div class="movements__value">${formattedCurrency(
          mov,
          acc.locale,
          acc.currency
        )}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', movementHTML);
  });
};

// Add usernames

const addUsername = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

addUsername(accounts);

// Log out timer

const startLogOutTimer = function () {
  let time = 300; // 5 minutes

  const tick = function () {
    time--;

    const min = String(Math.trunc(time / 60)).padStart(2, '0');
    const sec = String(time % 60).padStart(2, '0');

    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get started';
    }
  };
  tick();

  timer = setInterval(tick, 1000);
  return timer;
};

// Update UI

const updateUI = function (currentAccount) {
  // Display movements rows
  displayMovements(currentAccount);

  // Display total balance
  calcDisplayBalance(currentAccount);

  // Display deposit and withdrawals summary
  calcDisplaySummary(currentAccount);
};

//

// LABELS

// Balance

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((accu, val) => accu + val, 0);
  // labelBalance.textContent = `${acc.balance.toFixed(2)} €`;
  labelBalance.textContent = formattedCurrency(
    acc.balance,
    acc.locale,
    acc.currency
  );
};

const calcDisplaySummary = function (acc) {
  // In

  const totalDeposits = acc.movements
    .filter(function (val) {
      return val > 0;
    })
    .reduce(function (accu, val) {
      return accu + val;
    }, 0);

  // Out

  const totalWithdrawals = acc.movements
    .filter(function (val) {
      return val < 0;
    })
    .reduce(function (accu, val) {
      return accu + val;
    }, 0);

  // Interest

  const totalInterest = acc.movements
    .filter(function (val) {
      return val > 0;
    })
    .map(function (val) {
      return (val * acc.interestRate) / 100;
    })
    .filter(function (val) {
      return val >= 1;
    })
    .reduce(function (accu, val) {
      return accu + val;
    });

  // labelSumIn.textContent = `${totalDeposits.toFixed(2)} €`;
  // labelSumOut.textContent = `${Math.abs(totalWithdrawals).toFixed(2)} €`;
  // labelSumInterest.textContent = `${Math.abs(totalInterest).toFixed(2)} €`;

  labelSumIn.textContent = formattedCurrency(
    totalDeposits,
    acc.locale,
    acc.currency
  );
  labelSumOut.textContent = formattedCurrency(
    Math.abs(totalWithdrawals),
    acc.locale,
    acc.currency
  );
  labelSumInterest.textContent = formattedCurrency(
    Math.abs(totalInterest),
    acc.locale,
    acc.currency
  );
};

//

// FUNCTIONALITIES

// Login

let currentAccount, timer;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI

    containerApp.style.opacity = 100;

    // Display welcome message

    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;

    // Display current date (Previous)

    /*
    const now = new Date();
    const day = `${now.getDate()}`.padStart(2, 0);
    const month = `${now.getMonth() + 1}`.padStart(2, 0);
    const year = now.getFullYear();
    const hour = `${now.getHours()}`.padStart(2, 0);
    const minute = `${now.getMinutes()}`.padStart(2, 0);

    const currentTime = `${day}/${month}/${year}, ${hour}:${minute}`;
    labelDate.textContent = currentTime;
    */

    // Display current date

    const now = new Date();
    // const locale = navigator.language;
    // const locale = accounts.forEach(acc => acc.locale ? acc.locale : navigator.language);
    const options = {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      // weekday: 'long',
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // Clear input fields

    inputLoginUsername.value = inputLoginPin.value = '';

    inputLoginUsername.blur();
    inputLoginPin.blur();

    // Log out timer

    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI

    updateUI(currentAccount);
  }
});

//

// Transfer

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const date = new Date().toISOString();
  const receiverAccount = accounts.find(function (acc) {
    return acc.username === inputTransferTo.value;
  });

  if (
    amount > 0 &&
    receiverAccount &&
    currentAccount.balance >= amount &&
    receiverAccount?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(date);

    receiverAccount.movements.push(amount);
    receiverAccount.movementsDates.push(date);

    updateUI(currentAccount);

    clearInterval(timer);
    timer = startLogOutTimer();

    console.log(`Transfer successful!`);
    console.log(`You have transferred $${amount} to ${receiverAccount.owner}.`);
  } else {
    console.log(`Something went wrong.`);
  }

  inputTransferAmount.value = inputTransferTo.value = '';
});

// Loan

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);
  const date = new Date().toISOString();

  if (amount > 0 && currentAccount.movements.some(val => val >= amount / 10)) {
    setTimeout(function () {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(date);

      updateUI(currentAccount);

      clearInterval(timer);
      timer = startLogOutTimer();

      console.log(`Loan successful!`);
    }, 3000);
  } else {
    console.log(`Something went wrong.`);
  }

  inputLoanAmount.value = '';
});

// Delete Account

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const deleteAccountIndex = accounts.findIndex(function (acc) {
      return acc.username === currentAccount.username;
    });

    // Delete account
    accounts.splice(deleteAccountIndex, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

// Sort

let isSorted = false;

btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  displayMovements(currentAccount, !isSorted);

  isSorted = !isSorted;
});

//

// OTHER

// Fake Login/Always Logged In

/*
currentAccount = account1;
updateUI(currentAccount);
containerApp.style.opacity = 100;
*/

//

/////////////////////////////////////////////////
///// LECTURES

/*
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3));
console.log(Math.max(7, 20, 52, '43', 65));
console.log(Math.min(7, 20, 52, 43, 65));
console.log(Math.PI * Number.parseFloat('10px') ** 2);
console.log(Math.trunc(Math.random() * 6) + 1);

const randomInt = function (min, max) {
  return Math.trunc(Math.random() * (max - min) + 1) + min;
};
console.log(randomInt(7, 10));
*/

/*
// Rounding Integers

console.log(Math.round(23.3));
console.log(Math.round(23.9));

console.log(Math.ceil(23.3));
console.log(Math.ceil(23.9));

console.log(Math.floor(23.3));
console.log(Math.floor(23.9));

console.log(Math.trunc(23.3)); // Floor is better, but how?
*/

/*
// Remainder

console.log(8 % 2);
console.log(21 % 2);

const isEven = n => n % 2 === 0;

console.log(isEven(6));
console.log(isEven(37));
console.log(isEven(265));

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) {
      row.style.backgroundColor = 'orangered';
    }
    if (i % 3 === 0) {
      row.style.backgroundColor = 'blue';
    }
  });
});

// Numeric Separator

const price = 20_00;
console.log(price);

const str = '40_00';
console.log(Number(str));
console.log(parseInt(str));
*/

/*
// BigInt

console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER);

console.log(1000n * BigInt(1000));
console.log(1000n > 100);
*/

/*
// Create a date

const now = new Date();
console.log(now);

console.log(new Date('23 Aug 2020'));
console.log(new Date(account1.movementsDates[0]));
// console.log(new Date(2019, 9, 30, 21, 00, 00));
console.log(new Date(2019, 9, 30));

console.log(new Date(0));
console.log(new Date(3 * 24 * 60 * 60 * 1000));
*/

/*
// Working with dates

const future = new Date(2019, 9, 30, 21, 0);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());

console.log(future.toISOString());
console.log(future.getTime());
console.log(new Date(1572451200000));
console.log(Date.now());

future.setFullYear(2040);
console.log(future);
*/

/*
// Operation with dates

const daysInbetween = function (date1, date2) {
  return `${Math.abs(
    (new Date(date2) - new Date(date1)) / (1000 * 60 * 60 * 24)
  )} days in between`;
};
console.log(daysInbetween(`6 oct 2022`, `16 oct 2022`));
*/

/*
// Internationalization (Numbers)

const number = 14000605.19;
const options = {
  // style: 'unit',
  // unit: 'mile-per-hour',
  // style: 'percent',
  style: 'currency',
  currency: 'EUR',
};

console.log(`Original : ${number}`);
console.log(
  `US       : ${new Intl.NumberFormat('en-US', options).format(number)}`
);
console.log(
  `UK       : ${new Intl.NumberFormat('en-GB', options).format(number)}`
);
console.log(
  `Pakistan : ${new Intl.NumberFormat('en-PK', options).format(number)}`
);
console.log(
  `Germany  : ${new Intl.NumberFormat('de-DE', options).format(number)}`
);
console.log(
  `Syria    : ${new Intl.NumberFormat('ar-SY', options).format(number)}`
);
*/

/*
// setTimeout

const ingredients = ['olives', 'spinach'];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2} 🍕`),
  3000,
  ...ingredients
);
console.log('Waiting for pizza...');

// if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

// setInterval

const clock = setInterval(() => {
  const now = new Date();
  const nowNew = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
  console.log(nowNew);
}, 1000);
*/
