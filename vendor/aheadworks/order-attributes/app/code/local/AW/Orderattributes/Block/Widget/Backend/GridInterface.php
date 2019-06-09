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


interface AW_Orderattributes_Block_Widget_Backend_GridInterface
{
    /**
     * @return string
     */
    public function getColumnId();

    /**
     * @return array
     */
    public function getColumnProperties();

    /**
     * @param AW_Orderattributes_Model_Attribute_TypeInterface $type
     *
     * @return AW_Orderattributes_Block_Widget_Backend_GridAbstract
     */
    public function setTypeModel(AW_Orderattributes_Model_Attribute_TypeInterface $type);

    /**
     * @return AW_Orderattributes_Model_Attribute_TypeInterface
     */
    public function getTypeModel();

    /**
     * @param mixed $value
     *
     * @return AW_Orderattributes_Block_Widget_Backend_GridInterface
     */
    public function setValue($value);
}