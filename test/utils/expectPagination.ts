import { expect } from "chai";
import { BigNumber } from "ethers";

export const expectPagination = ([ids, total]: [
  ids: BigNumber[],
  total: BigNumber
]): {
  to: {
    be: {
      get empty(): void;
    };
  };
  with: {
    page: (expectedIds: number[]) => {
      and: {
        total: (expectedTotal: number) => void;
      };
    };
  };
} => {
  return {
    to: {
      be: {
        get empty(): void {
          expect(ids.map((x: BigNumber) => x.toNumber())).to.eql([]);
          expect(total).to.equal(0);

          return undefined;
        },
      },
    },
    with: {
      page: (expectedIds: number[]) => {
        expect(ids.map((x: BigNumber) => x.toNumber())).to.eql(expectedIds);
        return {
          and: {
            total: (expectedTotal: number) => {
              expect(total).to.equal(expectedTotal);
            },
          },
        };
      },
    },
  };
};
