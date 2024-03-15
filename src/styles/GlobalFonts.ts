import seolleimcoolTTFSemiBold from "../fonts/SEOLLEIMcool.woff";
import RixInooAriDuriR from "../fonts/RixInooAriDuriR.woff2";
import PretendardRegular from "../fonts/Pretendard-Regular.woff";

import { createGlobalStyle } from "styled-components";

const GlobalFont = createGlobalStyle`
@font-face {
    font-family: 'seolleimcoolTTFSemiBold';
    src: local('seolleimcoolTTFSemiBold'), url(${seolleimcoolTTFSemiBold}) format('woff');
    font-weight: normal;
    font-style: normal;
}

@font-face {
    font-family: 'RixInooAriDuriR';
    src: local('RixInooAriDuriR'), url(${RixInooAriDuriR}) format('woff2');
    font-weight: normal;
    font-style: normal;
}

@font-face {
    font-family: 'PretendardRegular';
    src: local('PretendardRegular'), url(${PretendardRegular}) format('woff');
    font-weight: 400;
    font-style: normal;
}`;

export default GlobalFont;
