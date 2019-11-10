require('mocha');
const {expect} = require('chai');
const {fromFunction, fromStub, fromStubs, UndefinedValueError} = require('../../dist/lib/partial-function');

describe('PartialFunction', () => {

  describe('fromFunction', () => {
    it('should create a partial function that can always apply a given value', () => {
      let invokeCount = 0;
      const doInvoke = () => invokeCount++;

      const inputs = [1, 'a', null, () => {}, /4123/];
      inputs.forEach(input => {
        const pf = fromFunction(doInvoke);
        pf.apply(input);
      });

      expect(invokeCount).to.equal(inputs.length);
    });
  });


  describe('fromStub', () => {
    it('should create a partial function that uses the given parameters', () => {
      let isDefinedAtCalled = false;
      let isApplyCalled = false;
      const stub = {
        isDefinedAt: value => { isDefinedAtCalled = true; return value == 42; },
        apply: value => { isApplyCalled = true; return value * 10; },
      };

      const pf = fromStub(stub);
      const result = pf.apply(42);

      expect(isDefinedAtCalled, 'isDefinedAtCalled should be true').to.be.true;
      expect(isApplyCalled, 'isApplyCalled should be true').to.be.true;
      expect(result).to.equal(420);
    });
  });


  describe('fromStubs', () => {
    describe('isDefinedAt', () => {
      it('should consider all stubs and return true if defined', () => {
        let isDefinedAtCalls = 0;
        let applyCalls = 0;
        const stubs = [
          {isDefinedAt: value => { isDefinedAtCalls++; return value == 1; }, apply: value => { applyCalls++; return `found1: ${value}`; }},
          {isDefinedAt: value => { isDefinedAtCalls++; return value == 2; }, apply: value => { applyCalls++; return `found2: ${value}`; }},
          {isDefinedAt: value => { isDefinedAtCalls++; return value == 3; }, apply: value => { applyCalls++; return `found3: ${value}`; }},
          {isDefinedAt: value => { isDefinedAtCalls++; return value == 4; }, apply: value => { applyCalls++; return `found4: ${value}`; }},
          {isDefinedAt: value => { isDefinedAtCalls++; return value == 5; }, apply: value => { applyCalls++; return `found5: ${value}`; }}
        ];

        const pf = fromStubs(stubs);
        const isDefined = pf.isDefinedAt(42);
        expect(isDefined).to.be.false;
        expect(isDefinedAtCalls).to.equal(stubs.length);
        expect(applyCalls).to.equal(0);
      });
    });

    describe('apply', () => {
      it('should consider necessary stubs, call apply only once, and terminate early defined early', () => {
        let isDefinedAtCalls = 0;
        let applyCalls = 0;
        const stubs = [
          {isDefinedAt: value => { isDefinedAtCalls++; return value == 1; }, apply: value => { applyCalls++; return `found1: ${value}`; }},
          {isDefinedAt: value => { isDefinedAtCalls++; return value == 2; }, apply: value => { applyCalls++; return `found2: ${value}`; }},
          {isDefinedAt: value => { isDefinedAtCalls++; return value == 3; }, apply: value => { applyCalls++; return `found3: ${value}`; }},
          {isDefinedAt: value => { isDefinedAtCalls++; return value == 4; }, apply: value => { applyCalls++; return `found4: ${value}`; }},
          {isDefinedAt: value => { isDefinedAtCalls++; return value == 5; }, apply: value => { applyCalls++; return `found5: ${value}`; }}
        ];

        const pf = fromStubs(stubs);
        const result = pf.apply(3);
        expect(result).to.equal('found3: 3');
        expect(isDefinedAtCalls).to.equal(3);
        expect(applyCalls).to.equal(1);
      });

      it('should consider all stubs and call apply only once if only last is defined', () => {
        let isDefinedAtCalls = 0;
        let applyCalls = 0;
        const stubs = [
          {isDefinedAt: value => { isDefinedAtCalls++; return value == 1; }, apply: value => { applyCalls++; return `found1: ${value}`; }},
          {isDefinedAt: value => { isDefinedAtCalls++; return value == 2; }, apply: value => { applyCalls++; return `found2: ${value}`; }},
          {isDefinedAt: value => { isDefinedAtCalls++; return value == 3; }, apply: value => { applyCalls++; return `found3: ${value}`; }},
          {isDefinedAt: value => { isDefinedAtCalls++; return value == 4; }, apply: value => { applyCalls++; return `found4: ${value}`; }},
          {isDefinedAt: value => { isDefinedAtCalls++; return value == 5; }, apply: value => { applyCalls++; return `found5: ${value}`; }}
        ];

        const pf = fromStubs(stubs);
        const result = pf.apply(5);
        expect(result).to.equal('found5: 5');
        expect(isDefinedAtCalls).to.equal(stubs.length);
        expect(applyCalls).to.equal(1);
      });

      it('should consider all stubs and throw error if undefined', () => {
        let isDefinedAtCalls = 0;
        let applyCalls = 0;
        const stubs = [
          {isDefinedAt: value => { isDefinedAtCalls++; return value == 1; }, apply: value => { applyCalls++; return `found1: ${value}`; }},
          {isDefinedAt: value => { isDefinedAtCalls++; return value == 2; }, apply: value => { applyCalls++; return `found2: ${value}`; }},
          {isDefinedAt: value => { isDefinedAtCalls++; return value == 3; }, apply: value => { applyCalls++; return `found3: ${value}`; }},
          {isDefinedAt: value => { isDefinedAtCalls++; return value == 4; }, apply: value => { applyCalls++; return `found4: ${value}`; }},
          {isDefinedAt: value => { isDefinedAtCalls++; return value == 5; }, apply: value => { applyCalls++; return `found5: ${value}`; }}
        ];

        try {
          const pf = fromStubs(stubs);
          pf.apply('foo');
          throw new Error('Should throw error');
        } catch (err) {
          expect(err, err.msg).to.be.instanceOf(UndefinedValueError);
          expect(isDefinedAtCalls).to.equal(stubs.length);
          expect(applyCalls).to.equal(0);
        }
      });
    });
  });


  describe('apply', () => {
    it('should apply when defined', () => {
      const stub = {
        isDefinedAt: value => value == 42,
        apply: value => value * 10
      };
      const pf = fromStub(stub);
      const result = pf.apply(42);
      expect(result).to.equal(420);
    });

    it('should throw an error when undefined', () => {
      let isApplyCalled = false;
      const stub = {
        isDefinedAt: value => value == 42,
        apply: value => { isApplyCalled = true; return value * 10; }
      };
      try {
        const pf = fromStub(stub);
        pf.apply(55);
        throw new Error('Should have thrown');
      } catch (err) {
        expect(isApplyCalled).to.be.false;
        expect(err, err.message).to.be.instanceof(UndefinedValueError);
      }
    });
  });

  describe('applyOrElse', () => {
    it('should apply when defined', () => {
      const stub = {
        isDefinedAt: value => value == 42,
        apply: value => value * 10
      };
      const pf = fromStub(stub);
      const result = pf.apply(42);
      expect(result).to.equal(420);
    });

    it('should apply fallback when undefined', () => {
      let isApplyCalled = false;
      const stub = {
        isDefinedAt: value => value == 42,
        apply: value => { isApplyCalled = true; return value * 10; }
      };

      const pf = fromStub(stub);
      const result = pf.applyOrElse(100, value => value / 2);

      expect(isApplyCalled).to.be.false;
      expect(result).to.equal(50);
    });

    it('should return fallback when undefined and fallback is not a function', () => {
      let isApplyCalled = false;
      const stub = {
        isDefinedAt: value => value == 42,
        apply: value => { isApplyCalled = true; return value * 10; }
      };

      const pf = fromStub(stub);
      const result = pf.applyOrElse(100, 'foo');

      expect(isApplyCalled).to.be.false;
      expect(result).to.equal('foo');
    });
  });


  describe('combine with another using orElse', () => {
    describe('apply', () => {
      it('should apply first pf when defined', () => {
        let isDefinedAtCalled1 = false;
        let isApplyCalled1 = false;
        const stub1 = {
          isDefinedAt: value => { isDefinedAtCalled1 = true; return value == 42; },
          apply: value => { isApplyCalled1 = true; return value * 10; }
        };

        let isDefinedAtCalled2 = false;
        let isApplyCalled2 = false;
        const stub2 = {
          isDefinedAt: value => { isDefinedAtCalled2 = true; return value == 100; },
          apply: value => { isApplyCalled2 = true; return value / 2; }
        };

        const pf1 = fromStub(stub1);
        const pf2 = fromStub(stub2);

        const pf = pf1.orElse(pf2);

        const result = pf.apply(42);

        expect(isDefinedAtCalled1, 'isDefinedAtCalled1 should be true').to.be.true;
        expect(isApplyCalled1, 'isApplyCalled1 should be true').to.be.true;
        expect(isDefinedAtCalled2, 'isDefinedAtCalled2 should be false').to.be.false;
        expect(isApplyCalled2, 'isApplyCalled2 should be false').to.be.false;
        expect(result).to.equal(420);
      });

      it('should apply second pf when first is undefined but second is', () => {
        let isDefinedAtCalled1 = false;
        let isApplyCalled1 = false;
        const stub1 = {
          isDefinedAt: value => { isDefinedAtCalled1 = true; return value == 42; },
          apply: value => { isApplyCalled1 = true; return value * 10; }
        };

        let isDefinedAtCalled2 = false;
        let isApplyCalled2 = false;
        const stub2 = {
          isDefinedAt: value => { isDefinedAtCalled2 = true; return value == 100; },
          apply: value => { isApplyCalled2 = true; return value / 2; }
        };

        const pf1 = fromStub(stub1);
        const pf2 = fromStub(stub2);

        const pf = pf1.orElse(pf2);

        const result = pf.apply(100);

        expect(isDefinedAtCalled1, 'isDefinedAtCalled1 should be true').to.be.true;
        expect(isApplyCalled1, 'isApplyCalled1 should be false').to.be.false;
        expect(isDefinedAtCalled2, 'isDefinedAtCalled2 should be true').to.be.true;
        expect(isApplyCalled2, 'isApplyCalled2 should be true').to.be.true;
        expect(result).to.equal(50);
      });

      it('should throw without applying anything when both undefined', () => {
        let isDefinedAtCalled1 = false;
        let isApplyCalled1 = false;
        const stub1 = {
          isDefinedAt: value => { isDefinedAtCalled1 = true; return value == 42; },
          apply: value => { isApplyCalled1 = true; return value * 10; }
        };

        let isDefinedAtCalled2 = false;
        let isApplyCalled2 = false;
        const stub2 = {
          isDefinedAt: value => { isDefinedAtCalled2 = true; return value == 100; },
          apply: value => { isApplyCalled2 = true; return value / 2; }
        };

        const pf1 = fromStub(stub1);
        const pf2 = fromStub(stub2);

        const pf = pf1.orElse(pf2);

        try {
          pf.apply('foo');
          throw new Error('Should have thrown');
        } catch (err) {
          expect(err, err.message).to.be.instanceof(UndefinedValueError);
          expect(isDefinedAtCalled1, 'isDefinedAtCalled1 should be true').to.be.true;
          expect(isApplyCalled1, 'isApplyCalled1 should be false').to.be.false;
          expect(isDefinedAtCalled2, 'isDefinedAtCalled2 should be true').to.be.true;
          expect(isApplyCalled2, 'isApplyCalled2 should be false').to.be.false;
        }
      });
    });
  });


  describe('combine with a mapping function using andThen', () => {
    describe('apply', () => {
      it('should apply when defined', () => {
        let isDefinedAtCalled = false;
        let isApplyCalled = false;
        const stub1 = {
          isDefinedAt: value => { isDefinedAtCalled = true; return value == 42; },
          apply: value => { isApplyCalled = true; return value * 10; }
        };

        let isSecondCalled = false;
        const second = value => { isSecondCalled = true; return `foo-${value}`; };

        const pf = fromStub(stub1).andThen(second);

        const result = pf.apply(42);

        expect(isDefinedAtCalled, 'isDefinedAtCalled should be true').to.be.true;
        expect(isApplyCalled, 'isApplyCalled should be true').to.be.true;
        expect(isSecondCalled, 'isSecondCalled should be true').to.be.true;
        expect(result).to.equal('foo-420');
      });

      it('should throw without applying both when undefined', () => {
        let isDefinedAtCalled = false;
        let isApplyCalled = false;
        const stub1 = {
          isDefinedAt: value => { isDefinedAtCalled = true; return value == 42; },
          apply: value => { isApplyCalled = true; return value * 10; }
        };

        let isSecondCalled = false;
        const second = value => { isSecondCalled = true; return `foo-${value}`; };

        const pf = fromStub(stub1).andThen(second);

        try {
          pf.apply('foo');
          throw new Error('Should have thrown');
        } catch (err) {
          expect(err, err.message).to.be.instanceof(UndefinedValueError);
          expect(isDefinedAtCalled, 'isDefinedAtCalled should be true').to.be.true;
          expect(isApplyCalled, 'isApplyCalled should be false').to.be.false;
          expect(isSecondCalled, 'isSecondCalled should be false').to.be.false;
        }
      });
    });
  });


  describe('combine with another partial function using andThen', () => {
    describe('apply', () => {
      it('should apply when both defined', () => {
        let isDefinedAtCalled1 = false;
        let isApplyCalled1 = false;
        const stub1 = {
          isDefinedAt: value => { isDefinedAtCalled1 = true; return value == 42; },
          apply: value => { isApplyCalled1 = true; return value * 10; }
        };

        let isDefinedAtCalled2 = false;
        let isApplyCalled2 = false;
        const stub2 = {
          isDefinedAt: value => { isDefinedAtCalled2 = true; return value == 420; },
          apply: value => { isApplyCalled2 = true; return value * 2; }
        };

        const pf1 = fromStub(stub1);
        const pf2 = fromStub(stub2);

        const pf = pf1.andThen(pf2);

        const result = pf.apply(42);

        expect(isDefinedAtCalled1, 'isDefinedAtCalled1 should be true').to.be.true;
        expect(isApplyCalled1, 'isApplyCalled1 should be true').to.be.true;
        expect(isDefinedAtCalled2, 'isDefinedAtCalled2 should be true').to.be.true;
        expect(isApplyCalled2, 'isApplyCalled2 should be true').to.be.true;
        expect(result).to.equal(840);
      });

      it('should throw without applying anything when both undefined', () => {
        let isDefinedAtCalled1 = false;
        let isApplyCalled1 = false;
        const stub1 = {
          isDefinedAt: value => { isDefinedAtCalled1 = true; return value == 42; },
          apply: value => { isApplyCalled1 = true; return value * 10; }
        };

        let isDefinedAtCalled2 = false;
        let isApplyCalled2 = false;
        const stub2 = {
          isDefinedAt: value => { isDefinedAtCalled2 = true; return value == 420; },
          apply: value => { isApplyCalled2 = true; return value * 2; }
        };

        const pf1 = fromStub(stub1);
        const pf2 = fromStub(stub2);

        const pf = pf1.andThen(pf2);

        try {
          pf.apply('foo');
          throw new Error('Should have thrown');
        } catch (err) {
          expect(err, err.message).to.be.instanceof(UndefinedValueError);
          expect(isDefinedAtCalled1, 'isDefinedAtCalled1 should be true').to.be.true;
          expect(isApplyCalled1, 'isApplyCalled1 should be false').to.be.false;
          expect(isDefinedAtCalled2, 'isDefinedAtCalled2 should be false').to.be.false;
          expect(isApplyCalled2, 'isApplyCalled2 should be false').to.be.false;
        }
      });

      it('should apply first but throw on second when first is defined but second isn\'t', () => {
        let isDefinedAtCalled1 = false;
        let isApplyCalled1 = false;
        const stub1 = {
          isDefinedAt: value => { isDefinedAtCalled1 = true; return value == 42; },
          apply: value => { isApplyCalled1 = true; return value * 10; }
        };

        let isDefinedAtCalled2 = false;
        let isApplyCalled2 = false;
        const stub2 = {
          isDefinedAt: value => { isDefinedAtCalled2 = true; return value == 500; },
          apply: value => { isApplyCalled2 = true; return value * 2; }
        };

        const pf1 = fromStub(stub1);
        const pf2 = fromStub(stub2);

        const pf = pf1.andThen(pf2);

        try {
          pf.apply(42);
          throw new Error('Should have thrown');
        } catch (err) {
          expect(err, err.message).to.be.instanceof(UndefinedValueError);
          expect(isDefinedAtCalled1, 'isDefinedAtCalled1 should be true').to.be.true;
          expect(isApplyCalled1, 'isApplyCalled1 should be true').to.be.true;
          expect(isDefinedAtCalled2, 'isDefinedAtCalled2 should be true').to.be.true;
          expect(isApplyCalled2, 'isApplyCalled2 should be false').to.be.false;
        }
      });
    });
  });

  
  describe('combine with an arbitrary value andThen', () => {
    describe('apply', () => {
      it('should call apply and first but return the second value', () => {
        let isDefinedAtCalled = false;
        let isApplyCalled = false;
        const stub1 = {
          isDefinedAt: value => { isDefinedAtCalled = true; return value == 42; },
          apply: value => { isApplyCalled = true; return value * 10; }
        };

        const pf = fromStub(stub1).andThen('bar');

        const result = pf.apply(42);

        expect(isDefinedAtCalled, 'isDefinedAtCalled should be true').to.be.true;
        expect(isApplyCalled, 'isApplyCalled should be true').to.be.true;
        expect(result).to.equal('bar');
      });

      it('should call apply and first but return the second value even if it\'s falsy', () => {
        let isDefinedAtCalled = false;
        let isApplyCalled = false;
        const stub1 = {
          isDefinedAt: value => { isDefinedAtCalled = true; return value == 42; },
          apply: value => { isApplyCalled = true; return value * 10; }
        };

        const pf = fromStub(stub1).andThen(null);

        const result = pf.apply(42);

        expect(isDefinedAtCalled, 'isDefinedAtCalled should be true').to.be.true;
        expect(isApplyCalled, 'isApplyCalled should be true').to.be.true;
        expect(result).to.equal(null);
      });
    });
  });


  describe('async partial functions', () => {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    describe('with async apply', () => {
      it('should apply if defined', async () => {
        let isApplyCalled = false;
        const duration = 100;
        const stub = {
          isDefinedAt: value => value == 42,
          apply: async value => { await delay(duration); isApplyCalled = true; return value * 10; }
        };
        const pf = fromStub(stub);
        const t0 = Date.now();
        const result = await pf.apply(42);
        expect(result).to.equal(420);
        expect(isApplyCalled).to.be.true;
        expect(Date.now() - t0).to.gte(duration);
      });

      it('should throw error if not defined', async () => {
        let isApplyCalled = false;
        const duration = 100;
        const stub = {
          isDefinedAt: value => value == 42,
          apply: async value => { await delay(duration); isApplyCalled = true; return value * 10; }
        };
        const pf = fromStub(stub);
        const t0 = Date.now();
        try {
          await pf.apply(55);
          throw new Error('Should have thrown an error');
        } catch (err) {
          expect(err).to.be.instanceOf(UndefinedValueError);
          expect(isApplyCalled).to.be.false;
          expect(Date.now() - t0).to.lt(duration);
        }
      });
    });
    
    describe('with async isDefinedAt', () => {
      it('should not await isDefinedAt and invoke the apply function', async () => {
        let isDefinedAtCalled = false;
        let isApplyCalled = false;
        const duration = 100;
        const stub = {
          isDefinedAt: async value => { await delay(duration); isDefinedAtCalled = true; return value == 42; },
          apply: value => { isApplyCalled = true; return value * 10; }
        };
        const pf = fromStub(stub);
        const t0 = Date.now();
        const result = await pf.apply(42);
        expect(result).to.equal(420);
        expect(isDefinedAtCalled).to.be.false;
        expect(isApplyCalled).to.be.true;
        expect(Date.now() - t0).to.lt(duration);
      });
    });

  });

});
