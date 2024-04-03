import { isEVMChain, isTerraChain } from "@certusone/wormhole-sdk";
import { Alert } from "@material-ui/lab";
import { useSelector } from "react-redux";
import { useHandleNFTTransfer } from "../../hooks/useHandleNFTTransfer";
import useIsWalletReady from "../../hooks/useIsWalletReady";
import {
  selectNFTSourceWalletAddress,
  selectNFTSourceChain,
  selectNFTTargetError,
  selectNFTTransferTx,
  selectNFTIsSendComplete,
  selectNFTTargetChain,
} from "../../store/selectors";
import { CHAINS_BY_ID } from "../../utils/consts";
import ButtonWithLoader from "../ButtonWithLoader";
import KeyAndBalance from "../KeyAndBalance";
import ShowTx from "../ShowTx";
import StepDescription from "../StepDescription";
import TerraFeeDenomPicker from "../TerraFeeDenomPicker";
import TransactionProgress from "../TransactionProgress";
import WaitingForWalletMessage from "./WaitingForWalletMessage";
import { GasEstimateSummary } from "../../hooks/useTransactionFees";
import SmartAddress from "../SmartAddress";

function Send() {
  const { handleClick, disabled, showLoader } = useHandleNFTTransfer();
  const sourceChain = useSelector(selectNFTSourceChain);
  const error = useSelector(selectNFTTargetError);
  const { isReady, statusMessage, walletAddress } =
    useIsWalletReady(sourceChain);
  const sourceWalletAddress = useSelector(selectNFTSourceWalletAddress);
  const transferTx = useSelector(selectNFTTransferTx);
  const isSendComplete = useSelector(selectNFTIsSendComplete);
  //The chain ID compare is handled implicitly, as the isWalletReady hook should report !isReady if the wallet is on the wrong chain.
  const isWrongWallet =
    sourceWalletAddress &&
    walletAddress &&
    sourceWalletAddress !== walletAddress;
  const isDisabled = !isReady || isWrongWallet || disabled;
  const errorMessage = isWrongWallet
    ? "A different wallet is connected than in Step 1."
    : statusMessage || error || undefined;
  const targetChain = useSelector(selectNFTTargetChain);
  return (
    <>
      <div style={{display: "flex", justifyContent: "flex-start"}}>
        <div>
          3. Tranfer NFT
        </div>
        <KeyAndBalance chainId={sourceChain} />
      </div>
      <StepDescription>
        Transfer the NFT to the NFT Bridge smart contract (custudy address)
      </StepDescription>
      <div>
        <SmartAddress chainId={targetChain} address={"uiushfiuahenbkfhshd"} />
      </div>
      {/* <KeyAndBalance chainId={sourceChain} /> */}
      {/* {isTerraChain(sourceChain) && (
        <TerraFeeDenomPicker disabled={disabled} chainId={sourceChain} />
      )} */}
      {/* <Alert severity="info" variant="outlined">
        This will initiate the transfer on {CHAINS_BY_ID[sourceChain].name} and
        wait for finalization. If you navigate away from this page before
        completing Step 4, you will have to perform the recovery workflow to
        complete the transfer.
      </Alert> */}
      <div>
        {isEVMChain(targetChain) && (
          <GasEstimateSummary methodType="nft" chainId={targetChain} />
        )}
      </div>
      <ButtonWithLoader
        disabled={isDisabled}
        onClick={handleClick}
        showLoader={showLoader}
        error={errorMessage}
      >
        Transfer
      </ButtonWithLoader>
      <WaitingForWalletMessage />
      {transferTx ? <ShowTx chainId={sourceChain} tx={transferTx} /> : null}
      <TransactionProgress
        chainId={sourceChain}
        tx={transferTx}
        isSendComplete={isSendComplete}
      />
    </>
  );
}

export default Send;
