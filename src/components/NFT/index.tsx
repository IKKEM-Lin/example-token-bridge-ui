import { ChainId } from "@certusone/wormhole-sdk";
import {
  Container,
  Step,
  StepButton,
  StepContent,
  Stepper,
  makeStyles,
} from "@material-ui/core";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";
import useCheckIfWormholeWrapped from "../../hooks/useCheckIfWormholeWrapped";
import useFetchTargetAsset from "../../hooks/useFetchTargetAsset";
import { setSourceChain, setStep, setTargetChain } from "../../store/nftSlice";
import {
  selectNFTActiveStep,
  selectNFTIsRedeemComplete,
  selectNFTIsRedeeming,
  selectNFTIsSendComplete,
  selectNFTIsSending,
} from "../../store/selectors";
import { CHAINS_WITH_NFT_SUPPORT } from "../../utils/consts";
import Redeem from "./Redeem";
import RedeemPreview from "./RedeemPreview";
import Send from "./Send";
import SendPreview from "./SendPreview";
import Source from "./Source";
import SourcePreview from "./SourcePreview";
import Target from "./Target";
import TargetPreview from "./TargetPreview";

const useStyles = makeStyles((theme) => ({
  steperWrapper: {
    display: "flex",
    justifyContent: "space-between",
    gap: "5vw",
  },
  stepLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "30px"
  },
  stepLeftBtn: {
    padding: "10px",
    border: "1px solid #ffffff32",
    color: "#ffffff32",
    fontSize: "12px",
    height: "42px",
    lineHeight: "20px",
    whiteSpace: "nowrap",
    borderRadius: "20px"
  },
  stepLeftNum: {
    fontSize: "14px",
    display: "inline-block",
    border: "1px solid #ffffff32",
    height: '20px',
    width: '20px',
    borderRadius: "50%",
    color: "#fff",
    textAlign: "center"
  },
  stepLeftBtnActive: {
    padding: "10px",
    border: "1px solid #ffffff32",
    fontSize: "12px",
    height: "42px",
    lineHeight: "20px",
    whiteSpace: "nowrap",
    borderRadius: "20px"
  },
  stepLeftNumActive: {
    fontSize: "14px",
    display: "inline-block",
    border: "1px solid c",
    height: '20px',
    width: '20px',
    borderRadius: "50%",
    background: "#11E095",
    textAlign: "center",
    color: "#000"
  },
  // stepLeftText: {},
}));

function NFT() {
  useCheckIfWormholeWrapped(true);
  useFetchTargetAsset(true);
  const dispatch = useDispatch();
  const activeStep = useSelector(selectNFTActiveStep);
  const isSending = useSelector(selectNFTIsSending);
  const isSendComplete = useSelector(selectNFTIsSendComplete);
  const isRedeeming = useSelector(selectNFTIsRedeeming);
  const isRedeemComplete = useSelector(selectNFTIsRedeemComplete);
  const preventNavigation =
    (isSending || isSendComplete || isRedeeming) && !isRedeemComplete;

  const { search } = useLocation();
  const query = useMemo(() => new URLSearchParams(search), [search]);
  const pathSourceChain = query.get("sourceChain");
  const pathTargetChain = query.get("targetChain");

  //This effect initializes the state based on the path params
  useEffect(() => {
    if (!pathSourceChain && !pathTargetChain) {
      return;
    }
    try {
      const sourceChain: ChainId | undefined = CHAINS_WITH_NFT_SUPPORT.find(
        (x) => parseFloat(pathSourceChain || "") === x.id
      )?.id;
      const targetChain: ChainId | undefined = CHAINS_WITH_NFT_SUPPORT.find(
        (x) => parseFloat(pathTargetChain || "") === x.id
      )?.id;

      if (sourceChain === targetChain) {
        return;
      }
      if (sourceChain) {
        dispatch(setSourceChain(sourceChain));
      }
      if (targetChain) {
        dispatch(setTargetChain(targetChain));
      }
    } catch (e) {
      console.error("Invalid path params specified.");
    }
  }, [pathSourceChain, pathTargetChain, dispatch]);

  useEffect(() => {
    if (preventNavigation) {
      window.onbeforeunload = () => true;
      return () => {
        window.onbeforeunload = null;
      };
    }
  }, [preventNavigation]);
  const classes = useStyles();
  const activeBtnFn = (step: number) => activeStep >=step ? classes.stepLeftBtnActive : classes.stepLeftBtn
  const activeBtnStyleFn = (step: number) => activeStep >=step ? {borderColor: "#11E095"} : {}
  const activeNumFn = (step: number) => activeStep >=step ? classes.stepLeftNumActive : classes.stepLeftNum
  return (
    <div className={classes.steperWrapper}>
      <div className={classes.stepLeft}>
        <div style={activeBtnStyleFn(0)} className={activeBtnFn(0)}>
          <span className={activeNumFn(0)}>1</span> Source chain
        </div>
        <div style={activeBtnStyleFn(1)} className={activeBtnFn(1)}>
          <span className={activeNumFn(1)}>2</span> Target chain
        </div>
        <div style={activeBtnStyleFn(2)} className={activeBtnFn(2)}>
          <span className={activeNumFn(2)}>3</span> Transfer NFT
        </div>
        <div style={activeBtnStyleFn(3)} className={activeBtnFn(3)}>
          <span className={activeNumFn(3)}>4</span> Redeem NFT
        </div>
      </div>
      <Container maxWidth="md">
        <Stepper activeStep={activeStep} orientation="vertical">
          <Step
            expanded={activeStep >= 0}
            disabled={preventNavigation || isRedeemComplete}
          >
            {/* <StepButton onClick={() => dispatch(setStep(0))} icon={null}>
            1. Source
          </StepButton> */}
            <StepContent>
              {activeStep === 0 ? <Source /> : <SourcePreview />}
            </StepContent>
          </Step>
          <Step
            expanded={activeStep >= 1}
            disabled={preventNavigation || isRedeemComplete || activeStep === 0}
          >
            {/* <StepButton onClick={() => dispatch(setStep(1))} icon={null}>
            2. Target
          </StepButton> */}
            <StepContent>
              {activeStep === 1 ? <Target /> : <TargetPreview />}
            </StepContent>
          </Step>
          <Step expanded={activeStep >= 2} disabled={isSendComplete}>
            {/* <StepButton disabled icon={null}>
            3. Send NFT
          </StepButton> */}
            <StepContent>
              {activeStep === 2 ? <Send /> : <SendPreview />}
            </StepContent>
          </Step>
          <Step expanded={activeStep >= 3} completed={isRedeemComplete}>
            {/* <StepButton
            onClick={() => dispatch(setStep(3))}
            disabled={!isSendComplete || isRedeemComplete}
            icon={null}
          >
            4. Redeem NFT
          </StepButton> */}
            <StepContent>
              {isRedeemComplete ? <RedeemPreview /> : <Redeem />}
            </StepContent>
          </Step>
        </Stepper>
      </Container>
    </div>
  );
}

export default NFT;
