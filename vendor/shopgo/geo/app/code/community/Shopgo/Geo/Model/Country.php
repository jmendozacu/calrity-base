<?php

class Shopgo_Geo_Model_Country extends Shopgo_Geo_Model_Abstract
{
    private $country;
    private $allowed_countries = array();

    public function __construct()
    {
        parent::__construct();

        $this->country = $this->getCountryByIp(Mage::helper('core/http')->getRemoteAddr());
        $allowCountries = explode(',', (string)Mage::getStoreConfig('general/country/allow'));
        $this->addAllowedCountry($allowCountries);
    }

    public function getCountryByIp($ip)
    {
        /** @var $wrapper Shopgo_Geo_Model_Wrapper */
        $wrapper = Mage::getSingleton('geo/wrapper');
        if ($wrapper->geo_open($this->local_file, 0)) {
            $country = $wrapper->geo_country_code_by_addr($ip);
            $wrapper->geo_close();

            return $country;
        } else {
            return null;
        }
    }

    public function getCountry()
    {
        return $this->country;
    }

    public function isCountryAllowed($country = '')
    {
        $country = $country ? $country : $this->country;
        if (count($this->allowed_countries) && $country) {
            return in_array($country, $this->allowed_countries);
        } else {
            return true;
        }
    }

    public function addAllowedCountry($countries)
    {
        $countries = is_array($countries) ? $countries : array($countries);
        $this->allowed_countries = array_merge($this->allowed_countries, $countries);

        return $this;
    }
}