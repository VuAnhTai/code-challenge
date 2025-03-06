interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // this field used in the code but not 
}

// bc FormattedWalletBalance have the same properties as WalletBalance but with formatted + add usdValue fields => use extends instead of implementing the interface will be more efficient
interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number; // new field to calculate the usd value
}

interface WalletPageProps extends BoxProps { // rename Props to WalletPageProps to avoid confusion

}

// add new type BlockchainName instead of using any to make the code more readable

type BlockchainName = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo' | string;
// Moved getPriority outside the component to prevent recreation on each render
const getPriority = (blockchain: BlockchainName): number => {
  switch (blockchain) {
    case 'Osmosis':
      return 100
    case 'Ethereum':
      return 50
    case 'Arbitrum':
      return 30
    case 'Zilliqa':
      return 20
    case 'Neo':
      return 20
    default:
      return -99
  }
}

const useStyles = makeStyles({
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

const WalletPage: React.FC<WalletPageProps> = (props) => {
  const { ...rest } = props; // children is not used in the code => remove it
  const balances = useWalletBalances();
  const prices = usePrices();
  const classes = useStyles(); // classes is used in the code => add it with useStyles
  const formattedBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
		  const balancePriority = getPriority(balance.blockchain);
      // lhsPriority not defined in the code => use balancePriority instead
		  if (balancePriority > -99 && balance.amount > 0) { // I think it should be balancePriority > -99 and balance.amount > 0 (show balance with amount > 0 => it depends on the business)
        return true;
      }
		  return false;
		}).sort((lhs: WalletBalance, rhs: WalletBalance) => {
      // sort by priority descending
			const leftPriority = getPriority(lhs.blockchain);
		  const rightPriority = getPriority(rhs.blockchain);
		  if (leftPriority > rightPriority) {
		    return -1;
		  } else if (rightPriority > leftPriority) {
		    return 1;
		  }
      // add return 0 here to avoid the error
      return 0;
    }).map((balance: WalletBalance) => {
      return {
        ...balance,
        formatted: balance.amount.toFixed(),
        usdValue: (prices[balance.currency] || 0) * balance.amount 
      }
    })
  }, [balances, prices]); // prices is not used in the code => add calculated usdValue to use prices
  // merge formattedBalances here to reduce unnecessary iterations over the data + better memoization


  // sortedBalances is not have formatted and usdPrice fields => use formattedBalances instead
  const rows = useMemo(() => { // Memoize the rows to prevent unnecessary re-renders
    return formattedBalances.map((balance: FormattedWalletBalance, index: number) => (
      <WalletRow
        className={classes.row}
        key={`${index}-${balance.blockchain}-${balance.currency}`} // Use a stable unique key
        amount={balance.amount}
        usdValue={balance.usdValue}
        formattedAmount={balance.formatted}
        blockchain={balance.blockchain}
        currency={balance.currency}
      />
    ));
  }, [formattedBalances]);

  return (
    <div {...rest}>
      {rows}
    </div>
  )
}