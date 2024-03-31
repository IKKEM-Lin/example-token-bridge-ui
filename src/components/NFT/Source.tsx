import { CHAIN_ID_SOLANA, isEVMChain } from "@certusone/wormhole-sdk";
import { Button, makeStyles } from "@material-ui/core";
import { VerifiedUser } from "@material-ui/icons";
import { Alert } from "@material-ui/lab";
import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import useIsWalletReady from "../../hooks/useIsWalletReady";
import { incrementStep, setSourceChain, setWalletSwitchOn } from "../../store/nftSlice";
import {
  selectNFTIsSourceComplete,
  selectNFTShouldLockFields,
  selectNFTSourceBalanceString,
  selectNFTSourceChain,
  selectNFTSourceError,
} from "../../store/selectors";
import {
  CHAINS_WITH_NFT_SUPPORT,
  getIsTransferDisabled,
} from "../../utils/consts";
import ButtonWithLoader from "../ButtonWithLoader";
import ChainSelect from "../ChainSelect";
import KeyAndBalance from "../KeyAndBalance";
import LowBalanceWarning from "../LowBalanceWarning";
import StepDescription from "../StepDescription";
import { TokenSelector } from "../TokenSelectors/SourceTokenSelector";
import ChainWarningMessage from "../ChainWarningMessage";

const useStyles = makeStyles((theme) => ({
  transferField: {
    marginTop: theme.spacing(5),
  },
}));

function Source() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const sourceChain = useSelector(selectNFTSourceChain);
  const uiAmountString = useSelector(selectNFTSourceBalanceString);
  const error = useSelector(selectNFTSourceError);
  const isSourceComplete = useSelector(selectNFTIsSourceComplete);
  console.log({isSourceComplete})
  const shouldLockFields = useSelector(selectNFTShouldLockFields);
  const { isReady, statusMessage } = useIsWalletReady(sourceChain, !isSourceComplete);
  const handleSourceChange = useCallback(
    (event) => {
      dispatch(setSourceChain(event.target.value));
      dispatch(setWalletSwitchOn(true))
    },
    [dispatch]
  );
  const handleNextClick = useCallback(() => {
    dispatch(incrementStep());
  }, [dispatch]);
  const isTransferDisabled = useMemo(() => {
    return getIsTransferDisabled(sourceChain, true);
  }, [sourceChain]);
  useEffect(() => {
    if (!isReady) {
      return;
    }
    dispatch(setWalletSwitchOn(false))
  }, [isReady])
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          From
      <KeyAndBalance chainId={sourceChain} />
        </div>
        <div>
          <ChainSelect
            variant="outlined"
            select
            fullWidth
            value={sourceChain}
            onChange={handleSourceChange}
            disabled={shouldLockFields}
            chains={CHAINS_WITH_NFT_SUPPORT}
          />
        </div>
      </div>
      {isEVMChain(sourceChain) ? (
        <Alert severity="info" variant="outlined">
          Only NFTs which implement ERC-721 are supported.
        </Alert>
      ) : null}
      {sourceChain === CHAIN_ID_SOLANA ? (
        <Alert severity="info" variant="outlined">
          Only NFTs with a supply of 1 are supported.
        </Alert>
      ) : null}

      {isReady || uiAmountString ? (
        <div className={classes.transferField}>
          <TokenSelector disabled={shouldLockFields} nft={true} />
        </div>
      ) : null}

      <LowBalanceWarning chainId={sourceChain} />
      <ChainWarningMessage chainId={sourceChain} />
      {/* <ButtonWithLoader
        disabled={!isSourceComplete || isTransferDisabled}
        onClick={handleNextClick}
        showLoader={false}
        error={statusMessage || error}
      >
        Next
      </ButtonWithLoader> */}
    </>
  );
}

export default Source;
