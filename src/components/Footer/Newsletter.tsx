import React from 'react';
import {useTranslations} from 'next-intl';

const Newsletter = () => {
    const t = useTranslations('Footer');

  return (
    <>
      <h3 className="text-gray-700 capitalize dark:text-white">
        {t("Newsletter")}
      </h3>
      <div className="flex flex-col mx-auto mt-6 space-y-3 md:space-y-0 md:flex-row">
        <div className="flex max-w-md">
          <input
            id="email-address"
            name="email"
            type="email"
            placeholder={t("EnterEmailAddress")}
            autoComplete="email"
            className="w-52 md:w-80 lg:w-60 rtl:rounded-r-md ltr:rounded-l-md bg-white dark:bg-white/5 px-3.5 py-3 text-base outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
          />
          <button
            type="submit"
            className="flex-none rtl:rounded-l-md ltr:rounded-r-md bg-primary px-10 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-primary-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
           {t("Join")}
          </button>
        </div>
      </div>
    </>
  );

};

export default Newsletter;
