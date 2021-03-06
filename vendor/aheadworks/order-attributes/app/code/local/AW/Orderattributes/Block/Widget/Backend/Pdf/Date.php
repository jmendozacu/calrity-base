<?php
/**
 * aheadWorks Co.
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the EULA
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://ecommerce.aheadworks.com/AW-LICENSE.txt
 *
 * =================================================================
 *                 MAGENTO EDITION USAGE NOTICE
 * =================================================================
 * This package designed for Magento community edition
 * aheadWorks does not guarantee correct work of this extension
 * on any other Magento edition except Magento community edition.
 * aheadWorks does not provide extension support in case of
 * incorrect edition usage.
 * =================================================================
 *
 * @category   AW
 * @package    AW_Orderattributes
 * @version    1.0.1
 * @copyright  Copyright (c) 2010-2012 aheadWorks Co. (http://www.aheadworks.com)
 * @license    http://ecommerce.aheadworks.com/AW-LICENSE.txt
 */

class AW_Orderattributes_Block_Widget_Backend_Pdf_Date
    extends AW_Orderattributes_Block_Widget_Backend_PdfAbstract
{
    public function getLabel()
    {
        return $this->_getLabel();
    }

    public function getValue()
    {
        $dateHtml = $this->_getValue();;
        if (!is_null($dateHtml)) {
            $format = Mage::app()->getLocale()->getDateFormat(Mage_Core_Model_Locale::FORMAT_TYPE_FULL);
            $dateHtml = $dateHtml->toString($format);
        } else {
            return array('');
        }
        return array($dateHtml);
    }

    protected function _getValue()
    {
        if (is_null($this->_value)) {
            $value = $this->getProperty('default_value');
            if (!is_null($value) && strlen(trim($value)) > 0) {
                try {
                    return Mage::app()->getLocale()->date($value, Zend_Date::ISO_8601);
                } catch(Exception $e) {
                    return $value;
                }
            } else {
                return null;
            }
        }
        return Mage::app()->getLocale()->date($this->_value, Zend_Date::ISO_8601);
    }
}