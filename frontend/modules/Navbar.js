import React from "react";
import Image from "next/image"
import { useRouter } from 'next/router';

import { Zilliqa } from '@zilliqa-js/zilliqa';
const { bytes } = require('@zilliqa-js/util');

import cusStyle from './style.module.css'

import { useDispatch, useSelector } from 'react-redux'
import { setWalletAddress, setContract, setContractState, setVersion, setMyInsignias, setTreasury } from "./ZilpaySlice";
import { bech32 } from './ZilpaySlice';

import useStorage from './hook.ts';

export const Navbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const rdxbech32 = useSelector(bech32);
  const { getItem, setItem, removeItem } = useStorage();

  const [openPopup, togglePopup] = React.useState(false);
  const [walletConnected, setWalletConnected] = React.useState(false);

  const onWallet = async () => {
    if (walletConnected) {
      togglePopup(!openPopup)
    }
    else {
      if (window.zilPay) {
        const zilPay = window.zilPay;
        const result = await zilPay.wallet.connect();
        if (result) {
          dispatch(setWalletAddress({
            base16:zilPay.wallet.defaultAccount.base16,
            bech32:zilPay.wallet.defaultAccount.bech32
          }));

          setWalletConnected(true);
          setItem('zilpay', zilPay.wallet.defaultAccount.base16);
        }
      }
      else {
        alert("Please install Zilpay");
      }
    }
  }

  const logout = () => {
    dispatch(setWalletAddress({
      base16:'',
      bech32:''
    }));

    setWalletConnected(false);
    togglePopup(false);
    removeItem('zilpay');
  }

  React.useEffect(() => {
    const run = async () => {
      var rpc = process.env.NEXT_PUBLIC_RPC_MAIN;
      var contract_address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MAIN;
      var chainId = process.env.NEXT_PUBLIC_CHAINID_MAIN;
      if (process.env.NEXT_PUBLIC_NETWORK_TYPE == 'test') {
        rpc = process.env.NEXT_PUBLIC_RPC_TEST;
        contract_address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_TEST;
        chainId = process.env.NEXT_PUBLIC_CHAINID_TEST;
      }
      var zilliqa = new Zilliqa(rpc);
      if (walletConnected) {
        const zilPay = window.zilPay;
        const result = await zilPay.wallet.connect();
        if (result) {
          zilliqa = zilPay;
        }
      }
      const contract = zilliqa.contracts.at(contract_address);
      const version = bytes.pack(Number(chainId), Number(process.env.MSG_VERSION));
      const state = await contract.getState();
      const treasury_address = state.treasury_address.arguments[0]?state.treasury_address.arguments[0]:'';
      dispatch(setVersion(version));
      dispatch(setContract(contract_address));
      dispatch(setContractState(state));
      dispatch(setTreasury(treasury_address));

      if (walletConnected) {
        var myInsignias = {}
        var holders = state.insignia_owners;
        for (var tid in holders) {
          myInsignias[tid] = [];
          for (var iid in holders[tid]) {
            if (holders[tid][iid].toUpperCase() == window.zilPay.wallet.defaultAccount.base16.toUpperCase()) {
              myInsignias[tid].push(iid);
            }
          }
        }
        dispatch(setMyInsignias(myInsignias))
      }
    };
    run();
  }, [walletConnected]);

  React.useEffect(() => {
    if (getItem('zilpay') != undefined && getItem('zilpay') != '') {
      onWallet();
    }
  }, []);

  return (
    <div className={`fixed w-full h-20 top-0 ${cusStyle.nav_bg} flex justify-between z-10`}>
      <div className={`h-full w-60 p-1 cursor-pointer`} onClick={() => router.push("/")}>
        <Image
          src="/logo.svg"
          layout="responsive"
          width={160}
          height={48}
          className="w-full"
          priority={true}
        />
      </div>
      <div className="mx-8 my-5">
        <div
          className="w-40 border rounded-full p-2 text-center font-medium text-white cursor-pointer hover:text-indigo-50"
          onClick={() => onWallet()}
        >
          { rdxbech32 == "" ?
            `Connect Wallet`
            : rdxbech32.substr(0, 6)+"..."+rdxbech32.substr(rdxbech32.length - 6)
          }
        </div>
        { openPopup ? 
          <div className="absolute -mt-6 ml-40">
            <div className="relative inline-block text-left">
                <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-xl shadow-lg bg-fuchsia-200 dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                  <div className="py-1 " role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <span className="block block px-4 py-2 text-md rounded-xl text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white dark:hover:bg-gray-600 cursor-pointer" role="menuitem" onClick={() => {router.push('/myinsignia')}}>
                      <span className="flex flex-col">
                        <span>
                          My Insignias
                        </span>
                      </span>
                    </span>
                    <span className="block block px-4 py-2 text-md rounded-xl text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white dark:hover:bg-gray-600 cursor-pointer" role="menuitem" onClick={() => {router.push('/treasury')}}>
                      <span className="flex flex-col">
                        <span>
                          Treasury Wallet
                        </span>
                      </span>
                    </span>
                    <span className="block block px-4 py-2 text-md rounded-xl text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white dark:hover:bg-gray-600 cursor-pointer" role="menuitem" onClick={() => logout()}>
                      <span className="flex flex-col">
                        <span>
                          Logout
                        </span>
                      </span>
                    </span>
                  </div>
                </div>
            </div>
          </div>
          : ""
        }
      </div>
    </div>
  )
}

