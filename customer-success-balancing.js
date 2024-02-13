const MIN_CUSTOMER_SUCCESS = 0;
const MAX_CUSTOMER_SUCCESS = 1000;

const MIN_CUSTOMER = 0;
const MAX_CUSTOMER = 1000000;

const MAX_CUSTOMER_SUCCESS_SCORE = 10000;
const MAX_CUSTOMER_SCORE = 100000;


const sortByScore = (itemA, itemB) => itemA.score - itemB.score
const sortByServedDesc = (csA, csB) => csB.served - csA.served

// aqui cada função auxiliadora poderia ficar dentro de uma pasta helpers por exemplo
// ao criar as funções separadas ajuda a manter os testes mais isolados, mantendo o escopo
const validateCustomerSuccess = ({
  maxCustomersSuccessAway,
  customersNotAway,
  customerSuccessAway
}) => {
  if (maxCustomersSuccessAway < customerSuccessAway.length) {
    throw new Error('Max customers success away exceeded');
  }

  if (MIN_CUSTOMER_SUCCESS >= customersNotAway.length) {
    throw new Error('Minimum customers success not reached');
  }

  if (MAX_CUSTOMER_SUCCESS <= customersNotAway.length) {
    throw new Error('Maximum customers success exceeded');
  }

  return true
};

const validateCustomerSuccessEntries = ({ customersNotAway }) => {
  customersNotAway.forEach((customerSuccess) => {
    if (customerSuccess.id === MIN_CUSTOMER_SUCCESS) {
      throw new Error('Minimum customer success id reached');
    }
    if (customerSuccess.id >= MAX_CUSTOMER_SUCCESS) {
      throw new Error('Maximum customer success id exceeded');
    }
    if (customerSuccess.score === MIN_CUSTOMER_SUCCESS) {
      throw new Error('Minimum customer success score reached');
    }
    if (customerSuccess.score >= MAX_CUSTOMER_SUCCESS_SCORE) {
      throw new Error('Maximum customer success score exceeded');
    }
  });
};

// o set cria um novo array eliminando os itens duplicados e apenas comparamos o tamanho dos arrays 
const hasDuplicateScores = (scores) => new Set(scores).size !== scores.length

const filterCustomerRules = (customerSuccess, customerSuccessAway) => {
  const customersNotAway = customerSuccess
    .filter((customerSuccess) => !customerSuccessAway.includes(customerSuccess.id))

  const maxCustomersSuccessAway = Math.floor(customerSuccess.length / 2);

  validateCustomerSuccess({ customersNotAway, maxCustomersSuccessAway, customerSuccessAway })

  validateCustomerSuccessEntries({ customersNotAway })

  const scores = customerSuccess.map(cs => cs.score)
  const duplicate = hasDuplicateScores(scores)

  if (duplicate) throw new Error('The customers success must have different levels')

  return customersNotAway
}

/**
 * Returns the id of the CustomerSuccess with the most customers
 * @param {array} customerSuccess
 * @param {array} customers
 * @param {array} customerSuccessAway
 */
function customerSuccessBalancing(
  customerSuccess,
  customers,
  customerSuccessAway
) {
  const customersFiltered = filterCustomerRules(customerSuccess, customerSuccessAway)

  const customersCount = customersFiltered
    .sort(sortByScore)
    .map((customerSuccess) => {
      //usando o forEach o teste 3 de performance não passa pois o forEach executa uma callback
      //em cada iteração resultando em um tempo maior de execução

      //por isso foi usado o loop for, além de usa-lo do maior para o menor pois ao removermos
      //os itens do menor para o maior, bagunçamos os indices de customers, removendo do final o 
      //índice se mantém

      //exemplo com o forEach
      // let served = 0;
      // customers.forEach((customer, index) => {
      //   if (customer.score <= customerSuccess.score) {
      //     customers.splice(index, 1);
      //     served++;
      //   }
      // });
      // return {
      //   ...customerSuccess,
      //   served,
      // }

      let served = 0;
      for (let i = customers.length - 1; i >= 0; i--) {
        const customer = customers[i];
        if (customer.score <= customerSuccess.score) {
          customers.splice(i, 1);
          served++;
        }
      }
      return {
        ...customerSuccess,
        served,
      };
    })
    .sort(sortByServedDesc);

  const firstCustomer = customersCount[0];
  const secondCustomer = customersCount[1];

  return firstCustomer?.served === secondCustomer?.served ? 0 : firstCustomer.id;
}

test("Scenario 1", () => {
  const css = [
    { id: 1, score: 60 },
    { id: 2, score: 20 },
    { id: 3, score: 95 },
    { id: 4, score: 75 },
  ];
  const customers = [
    { id: 1, score: 90 },
    { id: 2, score: 20 },
    { id: 3, score: 70 },
    { id: 4, score: 40 },
    { id: 5, score: 60 },
    { id: 6, score: 10 },
  ];
  const csAway = [2, 4];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(1);
});

function buildSizeEntities(size, score) {
  const result = [];
  for (let i = 0; i < size; i += 1) {
    result.push({ id: i + 1, score });
  }
  return result;
}

function mapEntities(arr) {
  return arr.map((item, index) => ({
    id: index + 1,
    score: item,
  }));
}

function arraySeq(count, startAt) {
  return Array.apply(0, Array(count)).map((it, index) => index + startAt);
}

// Nos testes poderíamos usar o modelo Triple A para deixar os testes mais legíveis
// exemplo:
// describe("when...", () => {
//   const css = mapEntities([11, 21, 31, 3, 4, 5]);
//   const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
//   const csAway = [];

//   it('should ....', () => {
//    expect(customerSuccessBalancing(css, customers, csAway)).toEqual(0);
//   })
// }); 

test("Scenario 2", () => {
  const css = mapEntities([11, 21, 31, 3, 4, 5]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(0);
});

test("Scenario 3", () => {
  const testTimeoutInMs = 100;
  const testStartTime = new Date().getTime();

  const css = mapEntities(arraySeq(999, 1));
  const customers = buildSizeEntities(10000, 998);
  const csAway = [999];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(998);

  if (new Date().getTime() - testStartTime > testTimeoutInMs) {
    throw new Error(`Test took longer than ${testTimeoutInMs}ms!`);
  }
});

test("Scenario 4", () => {
  const css = mapEntities([1, 2, 3, 4, 5, 6]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(0);
});

test("Scenario 5", () => {
  const css = mapEntities([100, 2, 3, 6, 4, 5]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(1);
});

test("Scenario 6", () => {
  const css = mapEntities([100, 99, 88, 3, 4, 5]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [1, 3, 2];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(0);
});

test("Scenario 7", () => {
  const css = mapEntities([100, 99, 88, 3, 4, 5]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [4, 5, 6];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(3);
});

test("Scenario 8", () => {
  const css = mapEntities([60, 40, 95, 75]);
  const customers = mapEntities([90, 70, 20, 40, 60, 10]);
  const csAway = [2, 4];
  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(1);
});

test("Duplicate customer success levels error", () => {
  const css = [
    { id: 1, score: 60 },
    { id: 2, score: 60 },
    { id: 3, score: 95 },
    { id: 4, score: 75 },
  ];
  const customers = [
    { id: 1, score: 90 },
    { id: 2, score: 20 },
    { id: 3, score: 70 },
    { id: 4, score: 40 },
    { id: 5, score: 60 },
    { id: 6, score: 10 },
  ];
  const csAway = [2, 4];

  expect(() => customerSuccessBalancing(css, customers, csAway))
    .toThrow('The customers success must have different levels');
});

test("Max customers success away exceeded error", () => {
  const css = mapEntities([100, 99, 88, 3, 4, 5]);
  const customers = mapEntities([10, 20, 30, 40, 50]);
  const csAway = [1, 2, 3, 4];

  expect(() => customerSuccessBalancing(css, customers, csAway))
    .toThrow('Max customers success away exceeded');
});

test("Minimum customers success not reached error", () => {
  const css = [];
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [];

  expect(() => customerSuccessBalancing(css, customers, csAway))
    .toThrow('Minimum customers success not reached');
});

test("Maximum customers success exceeded error", () => {
  const css = mapEntities(arraySeq(1001, 1));
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [];

  expect(() => customerSuccessBalancing(css, customers, csAway))
    .toThrow('Maximum customers success exceeded');
});

test("Minimum customer success id reached error", () => {
  const css = [{ id: 0, score: 60 }];
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [];

  expect(() => customerSuccessBalancing(css, customers, csAway))
    .toThrow('Minimum customer success id reached');
});

test("Maximum customer success id exceeded error", () => {
  const css = [{ id: 1001, score: 60 }];
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [];

  expect(() => customerSuccessBalancing(css, customers, csAway))
    .toThrow('Maximum customer success id exceeded');
});

test("Minimum customer success score reached error", () => {
  const css = [{ id: 1, score: 0 }];
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [];

  expect(() => customerSuccessBalancing(css, customers, csAway))
    .toThrow('Minimum customer success score reached');
});

test("Maximum customer success score exceeded error", () => {
  const css = [{ id: 1, score: 10001 }];
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [];

  expect(() => customerSuccessBalancing(css, customers, csAway))
    .toThrow('Maximum customer success score exceeded');
});