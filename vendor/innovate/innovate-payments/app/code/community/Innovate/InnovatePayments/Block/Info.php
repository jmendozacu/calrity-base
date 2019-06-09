<?php
/**
 * Magento
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://opensource.org/licenses/osl-3.0.php
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@magentocommerce.com so we can send you a copy immediately.
 *
 * @category	Innovate
 * @package	Innovate_InnovatePayments
 * @copyright	Copyright (c) 2011 Innovate Payments (http://www.innovatepayments.com/)
 */

class Innovate_InnovatePayments_Block_Info extends Mage_Payment_Block_Info
{
    protected function _construct()
    {
        parent::_construct();
        $this->setTemplate('innovatepayments/info.phtml');
    }

    public function getMethodCode()
    {
        return $this->getInfo()->getMethodInstance()->getCode();
    }

    public function toPdf()
    {
        $this->setTemplate('innovatepayments/pdf/info.phtml');
        return $this->toHtml();
    }
}
