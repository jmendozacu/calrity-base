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

class AW_Orderattributes_Block_Checkout_Multishipping_Overview extends Mage_Checkout_Block_Multishipping_Overview
{
    public function getBillingAddress()
    {
        $address = parent::getBillingAddress();
        $proxyAddress = new AW_Orderattributes_Block_Checkout_Multishipping_Overview_Address($address);
        return $proxyAddress;
    }

    public function getPaymentHtml()
    {
        $block = Mage::app()->getLayout()
            ->createBlock('aw_orderattributes/checkout_multishipping_attributes_paymentmethod')
            ->setTemplate('aw_orderattributes/checkout/multishipping/overview/payment_method.phtml')
        ;
        return parent::getPaymentHtml() . $block->toHtml();
    }
}